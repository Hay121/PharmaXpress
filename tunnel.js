import ngrok from '@ngrok/ngrok';

(async function() {
  try {
    const listener = await ngrok.forward({ 
      addr: 3000, 
      authtoken: '3AvZtUD72cWBdwQhrva75X8AOra_59wDaN35HHgZ4F5TFniNd' 
    });
    console.log(`\n======================================================`);
    console.log(`✅ NGROK TUNNEL BERHASIL AKTIF (GOD MODE)`);
    console.log(`🔗 URL Anda: ${listener.url()}`);
    console.log(`======================================================\n`);
    
    // Tahan proses agar tidak langsung keluar
    process.stdin.resume();
  } catch (err) {
    console.error("Gagal menjalankan Ngrok:", err);
  }
})();
