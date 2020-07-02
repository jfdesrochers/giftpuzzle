const m = window.m
const forge = window.forge

const PuzzleData = {
    puzzles: [
        {
            title: 'TRIAL #1',
            quote: 'David Jennings:<br>Excellent, the prince can be something of a...<br><br>Detective William Murdoch:<br>...pleasure seeker.<br><br>David Jennings:<br>Yes, that\'s one way of putting it.<br><br>Detective William Murdoch:<br>His reputation precedes him, Sir, but no need to worry; he\'ll be in good hands.<br><br>Inspector Brackenreid:<br>Quite right. Detective Murdoch goes out of his way to avoid pleasure.',
            attrib: ' - Murdoch Mysteries "The Prince and the Rebel" (2008)',
            hint: 'The password represents the gratification of finding one\'s place.',
            leftcard: 'Puzzle1Front.png',
            rightcard: 'Puzzle1Back.png',
            passwordHash: 'fa03720d52e9dfe38165ecffecc2c97d7390ce6ac25e7b071d969632aeac50d8'
        },
        {
            title: 'TRIAL #2',
            quote: 'Dr. Abigail Chase:<br>So, you believe that there is a treasure on the back of...<br><br>Benjamin Franklin Gates:<br>On the back of the Declaration of Independence.<br><br>Dr. Abigail Chase:<br>I\'d like to see your proof.<br><br>Benjamin Franklin Gates:<br>Uhhh. We don\'t have it.<br><br>Dr. Abigail Chase:<br>Did Bigfoot take it?',
            attrib: ' - National Treasure (2004)',
            hint: 'The password represents a place of peaceful isolation.',
            leftcard: 'Puzzle2Front.png',
            rightcard: 'Puzzle2Back.png',
            passwordHash: 'd937f01b7daf50dce79eca93e56b0f39341ca132b22e8fcde17d54240fda769b'
        },
        {
            title: 'TRIAL #3',
            quote: 'The Oracle:<br>Candy?<br><br>Neo:<br>Do you already know if I\'ll take it?<br><br>The Oracle:<br>Wouldn\'t be much of an oracle if I didn\'t.<br><br>Neo:<br>But if you already know, how can I make a choice?<br><br>The Oracle:<br>Because you didn\'t come here to make the choice. You\'ve already made it. You\'re here to try to understand why you made it. I thought you\'d have figured that out by now.',
            attrib: ' - The Matrix Reloaded (2003)',
            hint: 'The password represents an eternal bond between humans.',
            leftcard: 'Puzzle3Front.png',
            rightcard: 'Puzzle3Back.png',
            passwordHash: '0b4bd77cec705cf5df016344c0fc673fb3c2240078e6af572b2c5c6fa76114af'
        },
    ],
    encryptedSolution: '9986ae68ebbf4e8416ea5d2a4a9b62b8.050c006228409bda6a966f78099546d3085dfcc086cbea4de787fc0903443f49',
    state: {
        currentPuzzle: 0,
        solution: '',
        passwords: ['', '', ''],
        passwordError: false
    }
}

const PuzzleActions = {
    decryptSolution: function () {
        let [ct, iv] = PuzzleData.encryptedSolution.split('.')
        let md = forge.md.sha256.create()
        md.update(PuzzleData.state.passwords.join(''))
        let dc = forge.cipher.createDecipher('AES-CBC', md.digest().data)
        dc.start({iv: forge.util.hexToBytes(iv)})
        dc.update(forge.util.createBuffer(forge.util.hexToBytes(ct)))
        dc.finish()
        PuzzleData.state.solution = dc.output.data
        m.redraw()
    },
    checkPassword: function () {
        let password = PuzzleData.state.passwords[PuzzleData.state.currentPuzzle].toLowerCase().trim()
        let md = forge.md.sha256.create()
        md.update(password)
        if (md.digest().toHex() === PuzzleData.puzzles[PuzzleData.state.currentPuzzle].passwordHash) {
            PuzzleData.state.passwordError = false
            PuzzleData.state.passwords[PuzzleData.state.currentPuzzle] = password
            let cts = document.getElementById('contents')
            cts.classList.add('fade')
            setTimeout(() => {
                if (PuzzleData.state.currentPuzzle === 2) {
                    PuzzleActions.decryptSolution()
                } else {
                    PuzzleData.state.currentPuzzle++
                }
                m.redraw()
                cts.classList.remove('fade')
            }, 1000)
        } else {
            PuzzleData.state.passwordError = true
        }
    }
}

class PuzzleWindow {
    view () {
        return [
            m('img.background-image', {src: 'assets/img/PuzzleScreenBack.svg'}),
            m('.puzzle-back'),
            m('.card-back.left'),
            m('.card-back.right'),
            m('img.card.left', {src: `assets/img/${PuzzleData.puzzles[PuzzleData.state.currentPuzzle].leftcard}`}),
            m('img.card.right', {src: `assets/img/${PuzzleData.puzzles[PuzzleData.state.currentPuzzle].rightcard}`}),
            m('h1.puzzle-title', PuzzleData.puzzles[PuzzleData.state.currentPuzzle].title),
            m('.puzzle-quote', [
                m.trust(PuzzleData.puzzles[PuzzleData.state.currentPuzzle].quote),
                m.trust('<br><br>'),
                m('span.attribution', PuzzleData.puzzles[PuzzleData.state.currentPuzzle].attrib)
            ]),
            PuzzleData.state.passwordError ? m('h2.puzzle-password-prompt.wrong', 'Wrong password!') : m('h2.puzzle-password-prompt', 'Enter password to continue:'),
            m('input.puzzle-input', {
                oninput: (e) => {
                    PuzzleData.state.passwords[PuzzleData.state.currentPuzzle] = e.target.value
                },
                onkeyup: (e) => {
                    if (e.key === 'Enter') {
                        PuzzleActions.checkPassword()
                    } else {
                        if (e.key === 'Escape') {
                            PuzzleData.state.passwords[PuzzleData.state.currentPuzzle] = ''
                        }
                        if (PuzzleData.state.passwordError) {
                            PuzzleData.state.passwordError = false
                        }
                    }
                },
                value: PuzzleData.state.passwords[PuzzleData.state.currentPuzzle]
            }),
            m('.puzzle-hint', PuzzleData.puzzles[PuzzleData.state.currentPuzzle].hint)
        ]
    }
}

class WinningScreen {
    view () {
        return [
            m('img.background-image', {src: 'assets/img/PuzzleScreenBack.svg'}),
            m('.puzzle-back'),
            m('h1.puzzle-title', 'WINNER!'),
            m('h2.puzzle-winning-prompt', [
                m.trust('CONGRATULATIONS!<br><br>You will need the following number to open your gift:<br><br>'),
                m('span.attribution.larger', PuzzleData.state.solution)
            ])
        ]
    }
}

class ScreenRouter {
    view () {
        return PuzzleData.state.solution.length > 0 ? m(WinningScreen) : m(PuzzleWindow)
    }
}

m.mount(document.getElementById('contents'), ScreenRouter)