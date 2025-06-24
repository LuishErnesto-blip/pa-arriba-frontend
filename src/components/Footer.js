// src/components/Footer.js
import React from 'react';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    return (
        <footer className="bg-pa-black text-pa-white p-6 text-center text-sm mt-auto"> {/* Fondo oscuro, texto blanco, margen superior automático */}
            <div className="container mx-auto">
                <p>&copy; {currentYear} Pa' Arriba! Todos los derechos reservados.</p>
               <p> crece-avanza-mejora-re/emprende</p>
                <p className="mt-2">
                    Hecho con ❤️ para emprendedores Ecuatorianos.
                </p>
            </div>
        </footer>
    );
};

export default Footer;