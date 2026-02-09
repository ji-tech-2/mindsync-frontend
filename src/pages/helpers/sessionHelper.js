/**
 * Fungsi internal untuk membuat ID unik (seperti di kode lama Anda)
 */
function generateSessionId() {
  return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Menyimpan data ke Session Storage dengan Timestamp & ID Unik
 */
export function saveToSession(key, data) {
  try {
    // Kita generate ID baru setiap kali save, atau gunakan yang sudah ada
    const sessionData = {
      ...data,
      timestamp: new Date().toISOString(),
      // Cek apakah data sudah punya session_id? Jika belum, buat baru.
      session_id: data.session_id || generateSessionId(),
    };

    const serializedData = JSON.stringify(sessionData);
    sessionStorage.setItem(key, serializedData);

    console.log(
      `✅ Data saved to session [${key}] ID: ${sessionData.session_id}`
    );
    return true;
  } catch (error) {
    console.error('❌ Error saving to session:', error);
    return false;
  }
}

export function getFromSession(key) {
  try {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('❌ Error retrieving from session:', error);
    return null;
  }
}

export function removeFromSession(key) {
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing session:', error);
  }
}
