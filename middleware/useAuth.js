// src/hooks/useAuth.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const useAuth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkToken = () => {
      const token = sessionStorage.getItem('token');
      const tokenExpiry = sessionStorage.getItem('tokenExpiry');

      // Cek apakah token ada dan belum kedaluwarsa
      if (!token || (tokenExpiry && Date.now() > tokenExpiry)) {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('tokenExpiry');
        navigate('/login'); // Redirect ke halaman login jika token tidak valid
      }
    };

    checkToken();

    const intervalId = setInterval(checkToken, 60000); // Periksa token setiap 1 menit

    const resetTokenExpiry = () => {
      // Reset waktu kedaluwarsa token ke 1 jam dari sekarang
      sessionStorage.setItem('tokenExpiry', Date.now() + 3600000);
    };

    // Daftarkan event listeners untuk interaksi pengguna
    window.addEventListener('click', resetTokenExpiry);
    window.addEventListener('keypress', resetTokenExpiry);
    window.addEventListener('mousemove', resetTokenExpiry);
    window.addEventListener('scroll', resetTokenExpiry);

    return () => {
      clearInterval(intervalId); // Bersihkan interval saat komponen di-unmount
      // Hapus event listeners saat komponen di-unmount
      window.removeEventListener('click', resetTokenExpiry);
      window.removeEventListener('keypress', resetTokenExpiry);
      window.removeEventListener('mousemove', resetTokenExpiry);
      window.removeEventListener('scroll', resetTokenExpiry);
    };
  }, [navigate]);
};

export default useAuth;
