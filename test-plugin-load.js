try {
    const plugin = require('./node_modules/expo-splash-screen/app.plugin.js');
    console.log('Plugin loaded successfully');
    console.log(plugin);
} catch (error) {
    console.error('Error loading plugin:', error);
}
