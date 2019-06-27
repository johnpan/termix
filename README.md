
# termix - Terminal Expirience
  This is a UI-command-line utility to help typing the less keystrokes possible.
  It can be useful when a single command has to be used a lot of times.
  With this util the command can remember its parameters from previous invoke until they get changed
  To check what would be parsed, add `-help` or `help` according to the syntax you use at the eol
  or change command's setting `askVerification` to 1

### Two command-syntax styles
  
scenario 1 - bash syntax (dashes for params)
   * `insert -bus 123 -date 12-22-93 -text 'this is a bus route'`
   * `insert -bus 327 -text 'another bus, same date' `

scenario 2 - no dashes for params
   * `insert bus 123 date 12-22-93 text 'this is a bus route'`
   * `insert bus 327 text 'another bus, same date'`

### Common features

   * Use arrows to access commands history
   * Use `/e` to `eval()` javascript (There is an option to allow this, type `/opts -allow-eval 1`)
   * Easy access to LocalStorage
   * XHR requests watcher
   * GET & POST without jQuery
   * Load scripts and use predefined slugs instead of full URLs

### Special commands (built-in): they all start with `/`

   * Type `/help` for a list of special commands
   * Type `[/]{command} -help` fot full help text of this command
   * Commands in list: ...

### Termix options using `/options`

   * Type `/options -help` or `/opts -help` to get a full list of the termial settings

### Import your own commands

   * `/import-command -command myFirstCom -commandKey mfc -verification 1 -merge-policy 2 -method termix.log` or use `termix.importCommand` via code
   * Example 

### Available settings per command 

    * mergePolicy:
    * askVerification: 
    * ignoreParse: 

### Import dom elements to be watch and easily referenced

   * `/import-element -selectCommand document.querySelectorAll(".ReactVirtualized__Table")[0] -elemName termixPlaceholder` or use `termix.importElement` via code
   * Example 

### Extend terminal example

   * Example