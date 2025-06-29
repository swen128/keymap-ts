export type KC = 
  // Letters
  | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J'
  | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T'
  | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z'
  
  // Numbers
  | 'N0' | 'N1' | 'N2' | 'N3' | 'N4' | 'N5' | 'N6' | 'N7' | 'N8' | 'N9'
  
  // Function keys
  | 'F1' | 'F2' | 'F3' | 'F4' | 'F5' | 'F6' | 'F7' | 'F8' | 'F9' | 'F10' | 'F11' | 'F12'
  | 'F13' | 'F14' | 'F15' | 'F16' | 'F17' | 'F18' | 'F19' | 'F20' | 'F21' | 'F22' | 'F23' | 'F24'
  
  // Modifiers
  | 'LSHIFT' | 'RSHIFT' | 'LCTRL' | 'RCTRL' | 'LALT' | 'RALT' | 'LGUI' | 'RGUI'
  
  // Navigation
  | 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'HOME' | 'END' | 'PAGE_UP' | 'PAGE_DOWN'
  
  // Whitespace & Enter
  | 'ENTER' | 'RETURN' | 'RET' | 'SPACE' | 'TAB'
  
  // Deletion
  | 'BACKSPACE' | 'BSPC' | 'DELETE' | 'DEL'
  
  // Symbols
  | 'EXCLAMATION' | 'EXCL' | 'AT_SIGN' | 'AT' | 'HASH' | 'POUND'
  | 'DOLLAR' | 'DLLR' | 'PERCENT' | 'PRCNT' | 'CARET'
  | 'AMPERSAND' | 'AMPS' | 'ASTERISK' | 'STAR'
  | 'LEFT_PARENTHESIS' | 'LPAR' | 'RIGHT_PARENTHESIS' | 'RPAR'
  
  // Punctuation
  | 'PERIOD' | 'DOT' | 'COMMA' | 'SEMICOLON' | 'SEMI' | 'COLON'
  | 'SINGLE_QUOTE' | 'SQT' | 'DOUBLE_QUOTES' | 'DQT'
  
  // Brackets
  | 'LEFT_BRACKET' | 'LBKT' | 'RIGHT_BRACKET' | 'RBKT'
  | 'LEFT_BRACE' | 'LBRC' | 'RIGHT_BRACE' | 'RBRC'
  
  // Math operators
  | 'PLUS' | 'MINUS' | 'EQUAL' | 'UNDERSCORE' | 'UNDER'
  
  // Slashes
  | 'SLASH' | 'FSLH' | 'BACKSLASH' | 'BSLH' | 'PIPE'
  
  // Other symbols
  | 'GRAVE' | 'TILDE' | 'QUESTION' | 'QMARK' | 'LESS_THAN' | 'LT' | 'GREATER_THAN' | 'GT'
  
  // Lock keys
  | 'CAPS_LOCK' | 'CAPS' | 'NUM_LOCK' | 'KP_NUM' | 'SCROLL_LOCK' | 'SLCK'
  
  // System keys
  | 'ESCAPE' | 'ESC' | 'PRINTSCREEN' | 'PSCRN' | 'PAUSE_BREAK' | 'PAUSE' | 'INSERT' | 'INS'
  
  // Media keys
  | 'VOLUME_UP' | 'VOL_UP' | 'C_VOL_UP' | 'VOLUME_DOWN' | 'VOL_DN' | 'C_VOL_DN' | 'MUTE' | 'C_MUTE'
  | 'PLAY_PAUSE' | 'PP' | 'C_PP' | 'PLAY' | 'C_PLAY' | 'NEXT_TRACK' | 'NEXT' | 'C_NEXT' | 'PREVIOUS_TRACK' | 'PREV' | 'C_PREV' | 'STOP' | 'C_STOP'
  | 'EJECT' | 'C_EJECT' | 'C_MEDIA_HOME'
  
  // Brightness controls
  | 'C_BRI_UP' | 'C_BRI_DN' | 'C_BRI_MIN' | 'C_BRI_MAX' | 'C_BRI_AUTO'
  
  // Application keys
  | 'C_AL_FILES' | 'K_CALC' | 'K_WWW'
  
  // Keypad
  | 'KP_ASTERISK' | 'KP_PLUS' | 'KP_MINUS' | 'KP_SLASH' | 'KP_ENTER'
  | 'KP_DOT' | 'KP_COMMA' | 'KP_EQUAL'
  | 'KP_N0' | 'KP_N1' | 'KP_N2' | 'KP_N3' | 'KP_N4'
  | 'KP_N5' | 'KP_N6' | 'KP_N7' | 'KP_N8' | 'KP_N9';