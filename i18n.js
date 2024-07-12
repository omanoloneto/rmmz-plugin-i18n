/*:
 * @target MZ
 * @plugindesc Internationalization (i18n) Plugin for RPG Maker MZ.
 * @author omanoloneto
 * 
 * @help This plugin allows you to configure multiple languages and choose the game's language.
 *
 * @param defaultLanguage
 * @text Default Language Code
 * @desc The default language code of the game (en, pt, jp, etc).
 * @default en
 */

(() => {
    const pluginName = "i18n";
    const parameters = PluginManager.parameters(pluginName);
    const defaultLanguage = parameters['defaultLanguage'] || 'en';

    let currentLanguage = defaultLanguage;
    let translations = {};

    const fs = require('fs');
    const path = require('path');
    const basePath = path.join(process.cwd(), 'data/i18n/');

    // Function to create default language file
    function createDefaultLanguageFile() {
        if (!fs.existsSync(basePath)) {
            fs.mkdirSync(basePath, { recursive: true });
        }

        const defaultFilePath = path.join(basePath, `${defaultLanguage}.json`);
        if (!fs.existsSync(defaultFilePath)) {
            const defaultContent = {
                "i18n-code": "en",
                "i18n-name": "English",
                "language": "Language",
                "start-game": "Start Game",
                "options": "Options",
                "exit": "Exit"
            };
            fs.writeFileSync(defaultFilePath, JSON.stringify(defaultContent, null, 2));
            console.log(`Default language file created: ${defaultFilePath}`);
        }
    }

    // Load language files
    function loadTranslations() {
        const files = fs.readdirSync(basePath);
        files.forEach(file => {
            const filePath = path.join(basePath, file);
            const languageCode = path.basename(file, path.extname(file));
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            translations[languageCode] = data;
        });
    }

    // Sync language files to ensure all keys are present
    function syncLanguageFiles() {
        const defaultFilePath = path.join(basePath, `${defaultLanguage}.json`);
        const defaultData = JSON.parse(fs.readFileSync(defaultFilePath, 'utf8'));

        for (const [languageCode, data] of Object.entries(translations)) {
            let updated = false;
            for (const key in defaultData) {
                if (!(key in data)) {
                    data[key] = defaultData[key];
                    updated = true;
                }
            }
            if (updated) {
                const filePath = path.join(basePath, `${languageCode}.json`);
                fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
                console.log(`Updated language file: ${filePath}`);
            }
        }
    }

    // Translate a key
    function translate(key) {
        if (translations[currentLanguage] && translations[currentLanguage][key]) {
            return translations[currentLanguage][key];
        }
        return key;
    }

    // Set the language
    function setLanguage(languageCode) {
        if (translations[languageCode]) {
            currentLanguage = languageCode;
            console.log(`Language set to: ${languageCode}`);
        } else {
            console.error(`Language not found: ${languageCode}`);
        }
    }

    // Cycle to the next language
    function nextLanguage() {
        const keys = Object.keys(translations);
        const index = keys.indexOf(currentLanguage);
        const nextIndex = (index + 1) % keys.length;
        setLanguage(keys[nextIndex]);
    }

    // Cycle to the previous language
    function previousLanguage() {
        const keys = Object.keys(translations);
        const index = keys.indexOf(currentLanguage);
        const prevIndex = (index - 1 + keys.length) % keys.length;
        setLanguage(keys[prevIndex]);
    }

    // Initialize plugin
    function initialize() {
        createDefaultLanguageFile();
        loadTranslations();
        syncLanguageFiles();
    }

    // Load translations at the start
    initialize();

    // Register plugin command
    PluginManager.registerCommand(pluginName, "setLanguage", args => {
        setLanguage(args.language);
    });

    // Add option to the menu
    const _Window_Options_addGeneralOptions = Window_Options.prototype.addGeneralOptions;
    Window_Options.prototype.addGeneralOptions = function () {
        _Window_Options_addGeneralOptions.call(this);
        this.addCommand(translate("language"), 'language');
    };

    const _Window_Options_getConfigValue = Window_Options.prototype.getConfigValue;
    Window_Options.prototype.getConfigValue = function (symbol) {
        if (symbol === 'language') {
            return currentLanguage;
        }
        return _Window_Options_getConfigValue.call(this, symbol);
    };

    const _Window_Options_setConfigValue = Window_Options.prototype.setConfigValue;
    Window_Options.prototype.setConfigValue = function (symbol, value) {
        if (symbol === 'language') {
            setLanguage(value);
        } else {
            _Window_Options_setConfigValue.call(this, symbol, value);
        }
    };

    const _Window_Options_statusText = Window_Options.prototype.statusText;
    Window_Options.prototype.statusText = function (index) {
        const symbol = this.commandSymbol(index);
        if (symbol === 'language') {
            return translate("i18n-name");
        }
        return _Window_Options_statusText.call(this, index);
    };

    // Handle cursor movement for language selection
    const _Window_Options_cursorRight = Window_Options.prototype.cursorRight;
    Window_Options.prototype.cursorRight = function (wrap) {
        const index = this.index();
        const symbol = this.commandSymbol(index);
        if (symbol === 'language') {
            nextLanguage();
            this.redrawItem(index);
        } else {
            _Window_Options_cursorRight.call(this, wrap);
        }
    };

    const _Window_Options_cursorLeft = Window_Options.prototype.cursorLeft;
    Window_Options.prototype.cursorLeft = function (wrap) {
        const index = this.index();
        const symbol = this.commandSymbol(index);
        if (symbol === 'language') {
            previousLanguage();
            this.redrawItem(index);
        } else {
            _Window_Options_cursorLeft.call(this, wrap);
        }
    };

})();
