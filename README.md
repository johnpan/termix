
# termix - Terminal Expirience
  This is a UI-command-line utility to help typing the less keystrokes possible.
  It can be useful when a single command has to be used a lot of times.
  With this util the command can remember its parameters from previous invoke until they get changed
  To check what would be parsed, add `-help` or `help` according to the syntax you use at the eol
  or change command's setting `askVerification` to 1

# Two command-syntax styles
  
scenario 1 - bash syntax (dashes for params)
   * `insert -bus 123 -date 12-22-93 -text 'this is a bus route'`
   * `insert -bus 327 -text 'another bus, same date' `

scenario 2 - no dashes for params
   * `insert bus 123 date 12-22-93 text 'this is a bus route'`
   * `insert bus 327 text 'another bus, same date' `