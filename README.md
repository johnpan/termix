
# termix - Terminal Experience
  This is a UI-command-line utility to help typing the less keystrokes possible.
  It can be useful when a single command has to be used a lot of times.
  Each command can remember its parameters from previous invoke until they get changed, or use default values.
  To check what would be parsed, add `-help` parameter to your command
  or change command's setting `askVerification` to 1

### Common features

   * Bash syntax style
   * Parameters merge from previous invoke or/and use default values
   * Use cmd dialogs to ease user importing command params
   * Use arrows to access commands history
   * Use `/eval` to `eval()` javascript 
   * Easy access to LocalStorage
   * XHR requests watcher: `/watch-net`
   * GET & POST without jQuery, curl syntax! 
   * Load scripts and use predefined slugs instead of full URLs: `/load jquery`

### Bash syntax style
Use a space-plus-dash to seperate params. Dash is not forbiden in values
``` javascript
insert -text this is a bus route -bus 123 -date 12-22-93
 'insert': inserted: {"text":"'this is a bus route'","bus":123,"gate":"AF-44"}
```

### Merging parameters
Notice that `gate` param is added automatically
``` javascript
insert -text 'another bus' -bus 327
 'insert': inserted: {"text":"'another bus'","bus":327,"gate":"AF-44"}
```

### Default paremeters
Default values added if not supplied. Notice `verb` and `created` params.
``` javascript
insert -who john -what great
 'insert': inserted: {"who":"john","verb":"is","what":"great","created":"2019-09-27"}
```

### Commands short name
`insert` is setup to run also as `i`
``` javascript
i -bus 666 -date 1-1-2000
 'insert': inserted: {"date":"1-1-2000","bus":666,"date":"1-1-2000"}
```

### Eval
(There is an option to allow this, type `/opts -allow-eval 1`)

### Dialogs!
Plus nested dialogs, used as promises.
Nested dialog sample
``` javascript
termix.dialog([                    
   { question: "Go on with other questions? (y/n)", keyName: "go_on", default: "y" }
]).
then( (answers) => {
   if (answers.go_on == 'y') {
      termix.dialog([                    
         { question: "Like this one? (y/n)", keyName: "go", default: "n" }
      ]). 
      then( (answers) => {
         if (answers.go == 'n') {
            termix.log(`End of nested dialogs, thanks`);
         } else {
            termix.dialog([                    
               { question: "Fancy an ice-cream? (y/n)", keyName: "go1", default: "y" },
               { question: "Fancy an ice-skate? (y/n)", keyName: "go2", default: "y" },
               { question: "Fancy an ice-rock? (y/n)", keyName: "go3", default: "y" }
            ]). 
            then( (answers) => { 
               termix.log(`thanks`);
            });
         }
      });
   }
});
```

### Special commands

   * Built-in generic cmd commands that cannot be overwriten
   * They all start with `/`
   * They do not cache nor merge their previous input params

### Help. It helps

   * Type `/help -special` to get help of special commands
   * Type `/commands` to get a list of available commands   
   * Type `[/]{command} -help` for full help text of this command

### Termix options using `/options`

   * Type `/options -help` or `/opts -help` to get a full list of the termial settings

### Import your own commands

   * Use `termix.importCommand` to add custom commands to cmd
   * Example 
   ```javascript
   termix.importCommand (  
      {
         command: 'speak',
         help: 'syntax sample: speak -msg This is a test -voice 4',
         method: (dataObj) => {            
            const _msg = new SpeechSynthesisUtterance(dataObj.msg); 
            _msg.voice = window.speechSynthesis.getVoices()[(dataObj.voice || 4)];
            window.speechSynthesis.speak(_msg);
         }
      }
   )
   ```

### Available settings per command 

   * mergePolicy [0-3]: Defines how the incoming parameters should blend with the cached and the default ones. 
      0: (default option) merge all (Defaults are not required input)
      1: ignore defaults, merge lastData (defaults act as required input)
      2: merge defaults, ignore lastData (defaults are not overwriten by input)
      3: ignore all (defaults act as required input)
   * askVerification [0/1]: Termix will show dataObj to be executed and ask a verification enter
   * ignoreParse [0/1]: Send unparsed command line data. Termix will not parse the user input to a params objext
   * use-last-command [0|1]: If no command typed, use last command with the incoming params

### Import dom elements to be watch and easily referenced

   * `/import-element -selectCommand document.querySelectorAll(".ReactVirtualized__Table")[0] -elemName termixPlaceholder` or use `termix.importElement` via code
   * Example 

### Extend terminal example

   * Example