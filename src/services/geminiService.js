/**
 * Gemini Vision AI Service
 * Sends bill images to Google Gemini and extracts structured product data.
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

/**
 * Convert a File object to a base64 string
 */
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      // reader.result is "data:<mime>;base64,<data>" — we need just the base64 part
      const base64 = reader.result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Extract product items from a bill image using Gemini Vision API.
 * 
 * @param {File} imageFile - The bill/invoice image file
 * @returns {Promise<Array<{name: string, price: number, quantity: number}>>}
 */
export const extractItemsFromBill = async (imageFile) => {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
    throw new Error(
      'Gemini API key not configured. Please add your key to the .env file as VITE_GEMINI_API_KEY. ' +
      'Get a free key from https://aistudio.google.com/apikey'
    )
  }

  try {
    const base64Data = await fileToBase64(imageFile)
    const mimeType = imageFile.type || 'image/jpeg'

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `You are a pharmacy bill/invoice reader. Analyze this bill image carefully and extract ALL medicine/product items from it.

For each item, extract:
1. **name**: The medicine or product name exactly as written on the bill (include dosage/strength if visible, e.g. "Paracetamol 500mg")
2. **price**: Look specifically for the "MRP" (Maximum Retail Price) column. Do NOT use the wholesale "Rate", "Net Rate", "PTR", or taxable "Amount" columns for the price. The price must be the customer-facing retail MRP (as a number, no currency symbols).
3. **quantity**: The number of units/strips/pieces purchased (as a whole number). If quantity is not explicitly shown, use 1.

IMPORTANT RULES:
- Extract EVERY line item visible on the bill, even if partially readable
- Ignore headers, totals, tax lines, and discount lines — only extract actual product items
- If a name is partially cut off, include what's visible
- Prices should be numbers only (no ₹ or Rs.)
- Quantities should be whole numbers
- If you cannot read something clearly, make your best guess

Return ONLY a valid JSON array, no markdown, no explanation. Example format:
[
  {"name": "Paracetamol 500mg", "price": 35.50, "quantity": 2},
  {"name": "Amoxicillin 250mg", "price": 120, "quantity": 1}
]

If you cannot find any items, return an empty array: []`
            },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1, // Low temperature for precise extraction
        maxOutputTokens: 4096,
      },
    }

    let response;
    let retries = 3;
    let delay = 2000; // 2 seconds

    while (retries > 0) {
      response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        break; // Success!
      }
      
      // If it's a 503 (Overloaded) or 429 (Rate Limit), wait and retry
      if (response.status === 503 || response.status === 429) {
        console.warn(`Gemini API overloaded (Status ${response.status}). Retrying in ${delay/1000}s...`);
        retries--;
        if (retries === 0) break; // Give up
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 1.5; // Exponential backoff
      } else {
        break; // Don't retry on 400 Bad Request etc.
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData?.error?.message || `HTTP ${response.status}`
      
      if (response.status === 400 && errorMessage.includes('API key')) {
        throw new Error('Invalid Gemini API key. Please check your .env file.')
      }
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.')
      }
      throw new Error(`Gemini API error: ${errorMessage}`)
    }

    const data = await response.json()

    // Extract text from Gemini response
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) {
      throw new Error('Gemini returned an empty response. Try a clearer image.')
    }

    // Parse the JSON from the response (strip markdown code fences if present)
    let cleanText = text.trim()
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.slice(7)
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.slice(3)
    }
    if (cleanText.endsWith('```')) {
      cleanText = cleanText.slice(0, -3)
    }
    cleanText = cleanText.trim()

    const items = JSON.parse(cleanText)

    if (!Array.isArray(items)) {
      throw new Error('The scanner did not return a valid list. Try a clearer image.')
    }

    // Validate and clean each item
    return items
      .filter(item => item.name && item.name.trim() !== '')
      .map(item => ({
        name: String(item.name).trim(),
        price: parseFloat(item.price) || 0,
        quantity: parseInt(item.quantity) || 1,
      }))
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Scanner response could not be parsed. The bill may be too blurry or unclear. Please try again with a clearer image.')
    }
    throw error
  }
}
