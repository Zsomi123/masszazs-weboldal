// Ide kerül a backended címe. 
// Élesítéskor ezt majd átírod pl. 'https://emimassage.hu/api'-ra
const BASE_URL = 'http://localhost:5001/api';

/**
 * Egy univerzális fetch segédfüggvény, ami megspórolja nekünk a sok ismétlődő kódot.
 */
export const apiFetch = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    // Ha a szerver hibával tér vissza (pl. 400 vagy 500-as kód)
    if (!response.ok) {
      throw new Error(data.message || 'Szerver hiba történt!');
    }

    return data;
  } catch (error) {
    console.error(`API Hiba (${endpoint}):`, error);
    throw error; // Továbbdobjuk a hibát, hogy a komponens kiírhassa a felhasználónak
  }
};