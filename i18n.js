/*:
 * @target MZ
 * @plugindesc Internationalization (i18n) Plugin for RPG Maker MZ, with event key substitution support including actor names and dynamic label updates. Includes an option to add a language menu to the options menu.
 * @author omanoloneto
 * 
 * @help This plugin allows you to configure multiple languages and choose the game's language.
 * It also supports localization keys in event text and actor names using the format ${key}.
 *
 * @param defaultLanguage
 * @text Default Language Code
 * @desc The default language code of the game (en, pt, jp, etc).
 * @default en
 *
 * @param addLanguageMenu
 * @text Add Language Menu
 * @desc Whether to add a language option to the options menu. true or false
 * @type boolean
 * @default true
 *
 * @command setLanguage
 * @text Set Language
 * @desc Changes the current game language immediately.
 *
 * @arg language
 * @text Language Code
 * @desc Language code to switch to (must match a file in data/i18n/, e.g. en, pt, jp).
 * @type string
 * @default en
 */

(() => {
    const pluginName = "i18n";
    const parameters = PluginManager.parameters(pluginName);
    const defaultLanguage = parameters['defaultLanguage'] || 'en';
    const addLanguageMenu = (parameters['addLanguageMenu'] || 'true') === 'true';

    const storageKey = 'i18nLanguage';
    let currentLanguage = localStorage.getItem(storageKey) || defaultLanguage;
    let translations = {};

    let fs = null;
    let path = null;
    let basePath = null;
    if (Utils.isNwjs()) {
        fs = require('fs');
        path = require('path');
        basePath = path.join(process.cwd(), 'data/i18n/');
    }

    // Function to create default language file
    function createDefaultLanguageFile() {
        if (!fs) return;
        if (!fs.existsSync(basePath)) {
            fs.mkdirSync(basePath, { recursive: true });
        }

        const defaultFilePath = path.join(basePath, `${defaultLanguage}.json`);
        if (!fs.existsSync(defaultFilePath)) {
            const defaultContent = {
                "i18n-code": defaultLanguage,
                "i18n-name": "English",
                "language": "Language",
                "start-game": "Start Game",
                "options": "Options",
                "exit": "Exit"
            };
            fs.writeFileSync(defaultFilePath, JSON.stringify(defaultContent, null, 2));
            console.log(`[i18n] Default language file created: ${defaultFilePath}`);
        }
    }

    // Load language files
    function loadTranslations() {
        if (!fs) return;
        const files = fs.readdirSync(basePath);
        files.forEach(function(file) {
            if (path.extname(file).toLowerCase() !== '.json') return;
            const filePath = path.join(basePath, file);
            const languageCode = path.basename(file, path.extname(file));
            try {
                const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                translations[languageCode] = data;
            } catch (e) {
                console.error(`[i18n] Failed to parse language file: ${filePath}`, e);
            }
        });
    }

    // Sync language files to ensure all keys are present
    function syncLanguageFiles() {
        if (!fs) return;
        const defaultData = translations[defaultLanguage];
        if (!defaultData) {
            console.error(`[i18n] Cannot sync: default language "${defaultLanguage}" not loaded.`);
            return;
        }
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
                try {
                    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
                    console.log(`[i18n] Updated language file: ${filePath}`);
                } catch (e) {
                    console.error(`[i18n] Failed to write language file: ${filePath}`, e);
                }
            }
        }
    }

    // Translate a key
    function translate(key) {
        if (translations[currentLanguage] && translations[currentLanguage][key] !== undefined) {
            return translations[currentLanguage][key];
        }
        if (translations[defaultLanguage] && translations[defaultLanguage][key] !== undefined) {
            return translations[defaultLanguage][key];
        }
        return key;
    }

    // Function to replace localization keys in text
    function replaceLocalizationKeys(text) {
        return text.replace(/\${(.*?)}/g, (match, p1) => translate(p1));
    }

    // Extend Game_Message.add to handle localization keys
    const _Game_Message_add = Game_Message.prototype.add;
    Game_Message.prototype.add = function (text) {
        text = replaceLocalizationKeys(text);
        _Game_Message_add.call(this, text);
    };

    // Extend Game_Actor.name to handle localization keys
    const _Game_Actor_name = Game_Actor.prototype.name;
    Game_Actor.prototype.name = function () {
        const name = _Game_Actor_name.call(this);
        return replaceLocalizationKeys(name);
    };

    // Refresh all windows to reflect language change
    function refreshAllWindows() {
        const scene = SceneManager._scene;
        if (!scene || !scene._windowLayer) return;
        scene._windowLayer.children.forEach(function(window) {
            if (window.refresh) window.refresh();
        });
    }

    // Set the language
    function setLanguage(languageCode) {
        if (translations[languageCode]) {
            currentLanguage = languageCode;
            localStorage.setItem(storageKey, currentLanguage);
            console.log(`Language set to: ${languageCode}`);
            refreshAllWindows();
        } else {
            console.error(`Language not found: ${languageCode}`);
        }
    }

    // Cycle to the next language
    function nextLanguage() {
        const keys = Object.keys(translations);
        if (keys.length === 0) return;
        const index = keys.indexOf(currentLanguage);
        setLanguage(keys[(index + 1) % keys.length]);
    }

    // Cycle to the previous language
    function previousLanguage() {
        const keys = Object.keys(translations);
        if (keys.length === 0) return;
        const index = keys.indexOf(currentLanguage);
        setLanguage(keys[(index - 1 + keys.length) % keys.length]);
    }

    // Validate that currentLanguage is actually loaded
    function validateCurrentLanguage() {
        if (!translations[currentLanguage]) {
            console.warn(`[i18n] Language "${currentLanguage}" not found. Falling back to "${defaultLanguage}".`);
            if (translations[defaultLanguage]) {
                currentLanguage = defaultLanguage;
            } else {
                currentLanguage = Object.keys(translations)[0] || defaultLanguage;
                console.warn(`[i18n] Default language also not found. Using "${currentLanguage}".`);
            }
            localStorage.setItem(storageKey, currentLanguage);
        }
    }

    // Initialize plugin
    function initialize() {
        if (!fs) return;
        createDefaultLanguageFile();
        loadTranslations();
        syncLanguageFiles();
        validateCurrentLanguage();
    }

    // Load translations at the start
    initialize();

    // Register plugin command
    PluginManager.registerCommand(pluginName, "setLanguage", args => {
        setLanguage(args.language);
    });

    // Extend makeCommandList for menu windows to handle localization keys
    const _Window_MenuCommand_makeCommandList = Window_MenuCommand.prototype.makeCommandList;
    Window_MenuCommand.prototype.makeCommandList = function () {
        _Window_MenuCommand_makeCommandList.call(this);
        this._list.forEach(command => {
            command.name = replaceLocalizationKeys(command.name);
        });
    };

    const _Window_TitleCommand_makeCommandList = Window_TitleCommand.prototype.makeCommandList;
    Window_TitleCommand.prototype.makeCommandList = function () {
        _Window_TitleCommand_makeCommandList.call(this);
        this._list.forEach(command => {
            command.name = replaceLocalizationKeys(command.name);
        });
    };

    if (addLanguageMenu) {
        const _Window_Options_makeCommandList = Window_Options.prototype.makeCommandList;
        Window_Options.prototype.makeCommandList = function () {
            _Window_Options_makeCommandList.call(this);
            this._list.forEach(command => {
                command.name = replaceLocalizationKeys(command.name);
            });
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
                const langCode = this.getConfigValue(symbol);
                const langData = translations[langCode];
                return (langData && langData['i18n-name']) ? langData['i18n-name'] : langCode;
            }
            return _Window_Options_statusText.call(this, index);
        };

        const _Window_Options_cursorRight = Window_Options.prototype.cursorRight;
        Window_Options.prototype.cursorRight = function (wrap) {
            const index = this.index();
            const symbol = this.commandSymbol(index);
            if (symbol === 'language') {
                nextLanguage();
                this.redrawItem(index);
                refreshAllWindows();
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
                refreshAllWindows();
            } else {
                _Window_Options_cursorLeft.call(this, wrap);
            }
        };
    }
})();
