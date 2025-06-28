Develop a TypeScript DSL and web UI which supports writing keymap settings for ZMK-based keyboard, especially Glove80.

The DSL enables the user to write the keymap settings along with ZMK behaviors and such in type-safe way.
The DSL must be transpiled into the .keymap file.
The UI leverages takes the DSL and display it in human-friendly way.
The UI should array the keys according to the physical layout of the keyboard. See ![[moergo.png]]

See:
- https://github.com/moergo-sc/glove80-zmk-config
- https://zmk.dev/docs



## How to use it

Install it:
```
npm install keymap-editor
```

Create the designated `keymap.ts` file which default-export the DSL.

Open the web UI to preview the keymap:
```
npx keymap-editor preview 
```

Transpile the TypeScript DSL into .keymap file:
```
npx keymap-editor build
```

The name "keymap-editor" is arbitrary here. We should come up with better name.


