# RPG Maker MZ - i18n Plugin

The RPG Maker MZ i18n Plugin is a localization tool that allows you to configure multiple languages for your game. This plugin provides an easy way to switch between languages and ensures all language files are synchronized with the default language file.

## Features

- Set a default language for your game.
- Automatically create language files and folders.
- Sync language files to ensure all keys are present.
- Update in-game menus and settings to reflect the selected language.
- Allow players to change languages using directional keys.
- Optionally add a language option to the game settings menu.

## Installation

1. **Download the Plugin:**
   - Download the `i18n.js` file from this repository.

2. **Add the Plugin to Your Project:**
   - Copy the `i18n.js` file into your project's `plugins` folder.

3. **Create the Language Files:**
   - When the plugin is first loaded, it will create a default `en.json` file in the `data/i18n/` directory. This file contains the default language keys.

4. **Add the Plugin in RPG Maker MZ:**
   - Open your RPG Maker MZ project.
   - Go to the "Plugin Manager."
   - Click on an empty row, and add the `i18n.js` plugin.
   - Set the "Default Language Code" parameter to your desired default language (e.g., `en` for English, `pt` for Portuguese).
   - Set the "Add Language Menu" parameter to `true` if you want to add a language option to the game settings menu.

## Usage

1. **Creating Language Files:**
   - The plugin will create a default `en.json` file with the following structure:
     ```json
     {
         "i18n-code": "en",
         "i18n-name": "English",
         "language": "Language",
         "start-game": "Start Game",
         "options": "Options",
         "exit": "Exit"
     }
     ```
   - You can create additional language files (e.g., `pt.json`, `jp.json`) in the same folder with the appropriate translations.

2. **Syncing Language Files:**
   - When the game starts, the plugin will check all language files to ensure they have the same keys as the default language file. Missing keys will be added automatically.

3. **Changing Language In-Game:**
   - If "Add Language Menu" is set to `true`, players can select the language in the options menu using the directional keys.
   - The language name will be displayed using the `i18n-name` key from the language files.

4. **Localizing Texts:**
   - The plugin will automatically update the main menu, options menu, and other game texts to use the localized text based on the selected language.
   - Use localization keys in your texts, like `${start-game}`, and they will be replaced with the appropriate translation.

## Example

Here is an example of how to use the plugin:

1. Set the default language to English (`en`).
2. Create additional language files (`pt.json`, `jp.json`) with translations.
3. Players can change the language in the options menu (if enabled), and the game will update all texts to the selected language.

## Contributions

Contributions are welcome! Please feel free to submit a pull request or open an issue if you have any suggestions or improvements.

## Contact

If you have any questions or need further assistance, please contact me at [mano.afonso93@gmail.com].

## License

This project is licensed under the Creative Commons Attribution 4.0 International License. You are free to share, adapt, and use this project for both commercial and non-commercial purposes as long as you provide appropriate credit to the author.

See the [LICENSE](LICENSE) file for more details.
