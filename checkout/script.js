document.addEventListener('DOMContentLoaded', () => {
  
  // Fitur Copy Rekening
  const btnCopy = document.getElementById('btnCopy');
  const accNumber = document.getElementById('accNumber');

  if (btnCopy && accNumber) {
    btnCopy.addEventListener('click', () => {
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

  // Catatan: Form submission & modal ditangani oleh Firebase module script di index.html

});
