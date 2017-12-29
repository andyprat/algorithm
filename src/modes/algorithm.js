// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

import CodeMirror from 'codemirror'

CodeMirror.defineMode('algorithm.es', function () {
  function words (str) {
    var obj = {}, words = str.split(' ')
    for (var i = 0; i < words.length; ++i) obj[words[i]] = true
    return obj
  }
  var keywords = words('y arreglo caso constante hacer sino inicio fin para entero ' +
                       'booleano carapter funcion si mod null no o procedimiento ' +
                       'finpara finsi finmientras hasta algoritmo ' +
                       'variables repetir entonces mientras imprimir mostrar leer')
  var atoms = { 'null': true }

  var isOperatorChar = /[+\-*&%=<>!?|/]/

  function tokenBase (stream, state) {
    var ch = stream.next()
    if (ch === '#' && state.startOfLine) {
      stream.skipToEnd()
      return 'meta'
    }
    if (ch === '"' || ch === "'") {
      state.tokenize = tokenString(ch)
      return state.tokenize(stream, state)
    }
    if (ch === '(' && stream.eat('*')) {
      state.tokenize = tokenComment
      return tokenComment(stream, state)
    }
    if (/[[\]{}(),;:.]/.test(ch))
      return null

    if (/\d/.test(ch)) {
      stream.eatWhile(/[\w.]/)
      return 'number'
    }
    if (ch === '/')
      if (stream.eat('/')) {
        stream.skipToEnd()
        return 'comment'
      }

    if (isOperatorChar.test(ch)) {
      stream.eatWhile(isOperatorChar)
      return 'operator'
    }
    stream.eatWhile(/[\w$_]/)
    var cur = stream.current()
    if (keywords.propertyIsEnumerable(cur)) return 'keyword'
    if (atoms.propertyIsEnumerable(cur)) return 'atom'
    return 'variable'
  }

  function tokenString (quote) {
    return function (stream, state) {
      var escaped = false, next, end = false
      while ((next = stream.next()) !== null) {
        if (next === quote && !escaped) {
          end = true; break
        }
        escaped = !escaped && next === '\\'
      }
      if (end || !escaped) state.tokenize = null
      return 'string'
    }
  }

  function tokenComment (stream, state) {
    var maybeEnd = false, ch
    while (ch = stream.next()) {
      if (ch === ')' && maybeEnd) {
        state.tokenize = null
        break
      }
      maybeEnd = ch === '*'
    }
    return 'comment'
  }

  // Interface

  return {
    startState: function () {
      return { tokenize: null }
    },

    token: function (stream, state) {
      if (stream.eatSpace()) return null
      var style = (state.tokenize || tokenBase)(stream, state)
      if (style === 'comment' || style === 'meta') return style
      return style
    },

    electricChars: '{}'
  }
})

CodeMirror.defineMIME('text/x-pascal', 'pascal')
