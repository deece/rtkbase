#!/bin/bash
#
# configure_gps.sh: script to provide GPS modules with commands
# that are not saved in flash on the module (ie. they must be provided
# each time the module is started).

BASEDIR="$(dirname "$0")"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Farben für bessere Ausgabe
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funktion für farbige Ausgabe
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Installation und Setup
setup_installation() {
    print_status "Überprüfe Installation..."
    
    # Prüfe ob receiver_cfg Ordner und Dateien existieren
    if [[ ! -f "${BASEDIR}/receiver_cfg/LC29HBS_Configure.txt" ]]; then
        print_warning "receiver_cfg Dateien nicht gefunden. Kopiere Dateien..."
                
        # Kopiere Dateien vom aktuellen Script-Verzeichnis
        if [[ -d "${SCRIPT_DIR}/receiver_cfg" ]]; then
            cp -r "${SCRIPT_DIR}/receiver_cfg"/* "${BASEDIR}/receiver_cfg/"
            print_status "receiver_cfg Dateien kopiert"
        else
            print_error "Quell-receiver_cfg Ordner nicht gefunden in ${SCRIPT_DIR}"
            return 1
        fi
        
        if [[ -d "${SCRIPT_DIR}/tools" ]]; then
            cp -r "${SCRIPT_DIR}/tools"/* "${BASEDIR}/tools/"
            print_status "tools Dateien kopiert"
        else
            print_error "Quell-tools Ordner nicht gefunden in ${SCRIPT_DIR}"
            return 1
        fi
    else
        print_status "receiver_cfg Dateien bereits vorhanden"
    fi
    
    # Prüfe und erstelle settings.conf
    if [[ ! -f "${BASEDIR}/settings.conf" ]]; then
        if [[ -f "${BASEDIR}/settings.conf.default" ]]; then
            cp "${BASEDIR}/settings.conf.default" "${BASEDIR}/settings.conf"
            print_status "settings.conf von default erstellt"
        else
            print_error "settings.conf.default nicht gefunden"
            return 1
        fi
    fi
    
    # Konfiguriere settings.conf
    configure_settings
    
    return 0
}

# Settings konfigurieren
configure_settings() {
    print_status "Konfiguriere settings.conf..."
    
    echo -e "\n${BLUE}Wählen Sie Ihre Hardware-Konfiguration:${NC}"
    echo "1) Waveshare HAT (ttyS0, 115200 baud)"
    echo "2) Benutzerdefiniert"
    
    read -p "Ihre Wahl (1-2): " hw_choice
    
    case $hw_choice in
        1)
            # Waveshare Konfiguration
            sed -i 's/^com_port=.*/com_port=ttyS0/' "${BASEDIR}/settings.conf"
            sed -i 's/^com_port_settings=.*/com_port_settings=115200:8:n:1/' "${BASEDIR}/settings.conf"
            sed -i 's/^receiver=.*/receiver=Quectel LC29HBS/' "${BASEDIR}/settings.conf"
            print_status "Waveshare Konfiguration gesetzt"
            ;;
        2)
            # Benutzerdefinierte Konfiguration
            read -p "COM Port (z.B. ttyUSB0): " custom_port
            read -p "Baudrate (z.B. 115200): " custom_baud
            
            sed -i "s/^com_port=.*/com_port=${custom_port}/" "${BASEDIR}/settings.conf"
            sed -i "s/^com_port_settings=.*/com_port_settings=${custom_baud}:8:n:1/" "${BASEDIR}/settings.conf"
            sed -i 's/^receiver=.*/receiver=Quectel LC29HBS/' "${BASEDIR}/settings.conf"
            print_status "Benutzerdefinierte Konfiguration gesetzt"
            ;;
        *)
            print_warning "Ungültige Auswahl, verwende Standardwerte"
            ;;
    esac
}

# NMEA Kommando ausführen
execute_nmea_command() {
    local file="$1"
    local description="$2"
    
    if [[ ! -f "${BASEDIR}/receiver_cfg/${file}" ]]; then
        print_error "Datei ${file} nicht gefunden"
        return 1
    fi
    
    print_status "Führe aus: ${description}"
    python3 "${BASEDIR}"/tools/nmea.py --file "${BASEDIR}"/receiver_cfg/"${file}" /dev/"${com_port}" "${speed}" 3
    
    if [[ $? -eq 0 ]]; then
        print_status "${description} erfolgreich ausgeführt"
        return 0
    else
        print_error "${description} fehlgeschlagen"
        return 1
    fi
}

# Menü für LC29HBS Konfiguration
show_lc29hbs_menu() {
    while true; do
        echo -e "\n${BLUE}=== Quectel LC29HBS Konfiguration ===${NC}"
        echo "Port: /dev/${com_port} | Geschwindigkeit: ${speed}"
        echo ""
        echo "1) Alle Schritte ausführen (Factory Defaults → Configure → Save)"
        echo "2) Nur Configure und Save"
        echo "3) Nur Factory Defaults"
        echo "4) Nur Configure"
        echo "5) Nur Save"
        echo "6) Zurück zum Hauptmenü"
        echo ""
        read -p "Ihre Wahl (1-6): " choice
        
        case $choice in
            1)
                print_status "Führe alle Schritte aus..."
                execute_nmea_command "LC29HBS_Factory_Defaults.txt" "Factory Defaults"
                sleep 2
                execute_nmea_command "LC29HBS_Configure.txt" "Configuration"
                sleep 2
                execute_nmea_command "LC29HBS_Save.txt" "Save Configuration"
                ;;
            2)
                print_status "Führe Configure und Save aus..."
                execute_nmea_command "LC29HBS_Configure.txt" "Configuration"
                sleep 2
                execute_nmea_command "LC29HBS_Save.txt" "Save Configuration"
                ;;
            3)
                execute_nmea_command "LC29HBS_Factory_Defaults.txt" "Factory Defaults"
                ;;
            4)
                execute_nmea_command "LC29HBS_Configure.txt" "Configuration"
                ;;
            5)
                execute_nmea_command "LC29HBS_Save.txt" "Save Configuration"
                ;;
            6)
                break
                ;;
            *)
                print_warning "Ungültige Auswahl"
                ;;
        esac
        
        echo ""
        read -p "Drücken Sie Enter um fortzufahren..."
    done
}

# Hauptmenü
show_main_menu() {
    while true; do
        echo -e "\n${BLUE}=== GPS Konfiguration Tool ===${NC}"
        echo "1) Installation/Setup durchführen"
        echo "2) Settings neu konfigurieren"
        echo "3) GPS Modul konfigurieren"
        echo "4) Beenden"
        echo ""
        read -p "Ihre Wahl (1-4): " main_choice
        
        case $main_choice in
            1)
                setup_installation
                ;;
            2)
                configure_settings
                ;;
            3)
                # Lade Settings
                if [[ -f "${BASEDIR}/settings.conf" ]]; then
                    source <( grep -v '^#' "${BASEDIR}"/settings.conf | grep '=' )
                    
                    if [[ "${receiver}" = "Quectel LC29HBS" ]]; then
                        speed="${com_port_settings%%:*}"
                        show_lc29hbs_menu
                    else
                        print_error "Receiver '${receiver}' wird nicht unterstützt"
                    fi
                else
                    print_error "settings.conf nicht gefunden. Führen Sie zuerst die Installation durch."
                fi
                ;;
            4)
                print_status "Programm beendet"
                exit 0
                ;;
            *)
                print_warning "Ungültige Auswahl"
                ;;
        esac
    done
}

# Hauptprogramm
main() {
    echo -e "${GREEN}GPS Konfiguration Tool gestartet${NC}"
    
    # Prüfe ob Python3 verfügbar ist
    if ! command -v python3 &> /dev/null; then
        print_error "Python3 ist nicht installiert"
        exit 1
    fi
    
    show_main_menu
}

# Script starten
main "$@"
