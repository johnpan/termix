
# termix - Terminal Experience
  This is a UI-command-line utility to help typing the less keystrokes possible.
  It can be useful when a single command has to be used a lot of times.
  With this util the command can remember its parameters from previous invoke until they get changed.
  To check what would be parsed, add `-help` parameter to your command
  or change command's setting `askVerification` to 1

### Bash syntax style, but remembers last command and merges params
  
   * `insert -text 'this is a bus route' -bus 123 -date 12-22-93 `
   * `-text 'another bus, same date' -bus 327`

### Common features

   * Use cmd dialogs to ease user importing command params
   * Use arrows to access commands history
   * Use `/eval` to `eval()` javascript (There is an option to allow this, type `/opts -allow-eval 1`)
   * Easy access to LocalStorage
   * XHR requests watcher: `/watch-net`
   * GET & POST without jQuery, curl syntax! 
   * Load scripts and use predefined slugs instead of full URLs: `/load jquery`

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

### Dialogs!

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