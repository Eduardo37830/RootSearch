#!/bin/bash

# 🧪 Script de ayuda para ejecutar tests E2E de RootSearch

echo "🧪 RootSearch - Test Runner"
echo "=========================="
echo ""

# Función para mostrar el menú
show_menu() {
    echo "Selecciona una opción:"
    echo ""
    echo "1) Ejecutar TODOS los tests E2E"
    echo "2) Ejecutar solo tests de Autenticación"
    echo "3) Ejecutar solo tests de Gestión de Usuarios"
    echo "4) Ejecutar solo tests de Gestión de Cursos"
    echo "5) Ejecutar tests con cobertura (coverage)"
    echo "6) Ejecutar tests en modo watch"
    echo "7) Ver resultados del último test"
    echo "8) Limpiar caché de Jest"
    echo "0) Salir"
    echo ""
}

# Función para ejecutar tests
run_tests() {
    case $1 in
        1)
            echo "▶️  Ejecutando TODOS los tests E2E..."
            npm run test:e2e
            ;;
        2)
            echo "▶️  Ejecutando tests de Autenticación..."
            npm run test:e2e -- --testNamePattern="Authentication"
            ;;
        3)
            echo "▶️  Ejecutando tests de Gestión de Usuarios..."
            npm run test:e2e -- --testNamePattern="User Management"
            ;;
        4)
            echo "▶️  Ejecutando tests de Gestión de Cursos..."
            npm run test:e2e -- --testNamePattern="Course Management"
            ;;
        5)
            echo "▶️  Ejecutando tests con cobertura..."
            npm run test:e2e -- --coverage
            ;;
        6)
            echo "▶️  Ejecutando tests en modo watch..."
            npm run test:e2e -- --watch
            ;;
        7)
            echo "📊 Mostrando resultados del último test..."
            if [ -d "coverage" ]; then
                echo "Abriendo reporte de cobertura..."
                if command -v xdg-open &> /dev/null; then
                    xdg-open coverage/lcov-report/index.html
                elif command -v open &> /dev/null; then
                    open coverage/lcov-report/index.html
                else
                    echo "No se puede abrir automáticamente. Abre: coverage/lcov-report/index.html"
                fi
            else
                echo "⚠️  No hay reportes de cobertura. Ejecuta primero la opción 5."
            fi
            ;;
        8)
            echo "🧹 Limpiando caché de Jest..."
            npx jest --clearCache
            echo "✅ Caché limpiado"
            ;;
        0)
            echo "👋 ¡Hasta luego!"
            exit 0
            ;;
        *)
            echo "❌ Opción inválida"
            ;;
    esac
}

# Loop principal
while true; do
    show_menu
    read -p "Opción: " option
    echo ""
    run_tests $option
    echo ""
    echo "=========================="
    echo ""
    read -p "Presiona Enter para continuar..."
    clear
done
