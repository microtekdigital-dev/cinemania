export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-12 py-6 px-4 text-center text-gray-500 text-sm">
      <p>© {new Date().getFullYear()} Cinemanía. Todos los derechos reservados.</p>
      <p className="mt-1 text-xs text-gray-600">
        Este sitio no almacena ningún archivo en sus servidores. Todo el contenido es proporcionado por terceros.
      </p>
    </footer>
  );
}
