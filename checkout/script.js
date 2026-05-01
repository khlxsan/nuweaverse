document.addEventListener('DOMContentLoaded', () => {
  
  // Fitur Copy Rekening
  const btnCopy = document.getElementById('btnCopy');
  const accNumber = document.getElementById('accNumber');

  if (btnCopy && accNumber) {
    btnCopy.addEventListener('click', () => {
      // Create a temporary textarea to copy text
      const tempInput = document.createElement('textarea');
      tempInput.value = accNumber.innerText;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);

      // Feedback visual
      const originalSVG = btnCopy.innerHTML;
      btnCopy.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="#28a745" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      setTimeout(() => {
        btnCopy.innerHTML = originalSVG;
      }, 2000);
    });
  }

  // Handle Form Submission to WhatsApp
  const checkoutForm = document.getElementById('checkoutForm');
  
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault(); // Mencegah reload halaman

      // Ambil data dari form
      const nama = document.getElementById('nama').value.trim();
      const whatsapp = document.getElementById('whatsapp').value.trim();
      const alamat = document.getElementById('alamat').value.trim();
      const catatan = document.getElementById('catatan').value.trim();

      // Produk & Harga (Saat ini hardcoded karena hanya ada 1 produk pesanan utama)
      const productName = "Sasmita Nusantara";
      const productPrice = "Rp1.050.000";
      
      // Nomor WA Admin (Nuweav)
      const adminWA = "6281339499293";

      // Susun pesan WhatsApp
      let message = `Halo Nuweav, saya ingin memesan produk berikut:%0A%0A`;
      message += `*Detail Pesanan:*%0A`;
      message += `- Produk: ${productName}%0A`;
      message += `- Harga: ${productPrice}%0A%0A`;
      
      message += `*Data Pengiriman:*%0A`;
      message += `- Nama: ${nama}%0A`;
      message += `- No. WA: ${whatsapp}%0A`;
      message += `- Alamat: ${alamat}%0A`;
      
      if (catatan) {
        message += `- Catatan: ${catatan}%0A`;
      }

      message += `%0A---------------------------%0A`;
      message += `Saya akan segera melakukan transfer ke rekening BPD DIY (041.262.002895) dan mengirimkan bukti transfernya di obrolan ini. Terima kasih.`;

      // Redirect ke WhatsApp
      const waURL = `https://wa.me/${adminWA}?text=${message}`;
      window.open(waURL, '_blank');
    });
  }

});
