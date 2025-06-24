// src/components/LoadingBar3D.js
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const LoadingBar3D = ({ progress }) => {
    const mountRef = useRef(null); // Referencia al div donde se montará la escena 3D

    useEffect(() => {
        if (!mountRef.current) return;

        // 1. Configuración de la Escena
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf3f4f6); // Un gris claro para el fondo

        // 2. Configuración de la Cámara
        const camera = new THREE.PerspectiveCamera(
            75, // Campo de visión
            mountRef.current.clientWidth / mountRef.current.clientHeight, // Aspecto
            0.1, // Near clipping plane
            1000 // Far clipping plane
        );
        camera.position.set(0, 0, 5); // Posición de la cámara

        // 3. Configuración del Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        // Limpiar cualquier renderizado previo
        while (mountRef.current.firstChild) {
            mountRef.current.removeChild(mountRef.current.firstChild);
        }
        mountRef.current.appendChild(renderer.domElement);

        // Ajustar el tamaño del renderizador en caso de redimensionamiento de la ventana
        const handleResize = () => {
            camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        };
        window.addEventListener('resize', handleResize);

        // 4. Añadir Luz
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7); // Luz ambiental suave
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5); // Luz direccional
        directionalLight.position.set(0, 5, 5);
        scene.add(directionalLight);

        // 5. Crear la Barra de Carga (Cilindro como una pila)
        const baseHeight = 2; // Altura máxima para la pila
        const radius = 1; // Radio de la pila
        const segments = 32; // Segmentos para suavidad

        const geometry = new THREE.CylinderGeometry(radius, radius, baseHeight, segments);
        const material = new THREE.MeshPhongMaterial({ color: 0x4CAF50 }); // Color verde inicial
        const loadingBar = new THREE.Mesh(geometry, material);
        scene.add(loadingBar);

        // Posicionar la barra para que crezca desde abajo
        loadingBar.position.y = -baseHeight / 2; // La base del cilindro en y=0

        // 6. Animación de la Barra de Carga
        const animate = () => {
            requestAnimationFrame(animate);

            // Calcular la altura actual de la barra basada en el progreso (0-100)
            const currentHeight = (progress / 100) * baseHeight;
            loadingBar.scale.y = progress / 100; // Escala la altura de la barra
            loadingBar.position.y = (progress / 100) * (baseHeight / 2) - (baseHeight / 2); // Ajusta la posición para que crezca desde la base

            // Cambiar color basado en el progreso (opcional, de verde a naranja a rojo)
            if (progress < 33) {
                loadingBar.material.color.set(0x4CAF50); // Verde
            } else if (progress < 66) {
                loadingBar.material.color.set(0xFFC107); // Naranja
            } else {
                loadingBar.material.color.set(0xF44336); // Rojo
            }


            renderer.render(scene, camera);
        };

        animate();

        // 7. Limpieza al desmontar el componente
        return () => {
            window.removeEventListener('resize', handleResize);
            if (mountRef.current) {
                mountRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
            geometry.dispose();
            material.dispose();
            scene.remove(loadingBar); // Eliminar la barra de la escena
            scene.traverse(object => { // Disponer de todos los objetos en la escena
                if (object.isMesh) {
                    object.geometry.dispose();
                    object.material.dispose();
                }
            });
        };
    }, [progress]); // Re-renderiza la escena cuando el progreso cambia

    // Retorna un div donde Three.js montará el canvas
    return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
};

export default LoadingBar3D;