import Logo1 from '../assets/avatars/avatar-prof-flat-01.svg'
import Logo2 from '../assets/avatars/avatar-prof-flat-02.svg'
import Logo3 from '../assets/avatars/avatar-prof-flat-03.svg'
import Logo4 from '../assets/avatars/avatar-prof-flat-04.svg'
import Logo5 from '../assets/avatars/avatar-prof-flat-05.svg'
import Logo6 from '../assets/avatars/avatar-prof-flat-06.svg'
import Logo7 from '../assets/avatars/avatar-prof-flat-07.svg'
import Logo8 from '../assets/avatars/avatar-prof-flat-08.svg'
import Logo9 from '../assets/avatars/avatar-prof-flat-09.svg'
import Logo10 from '../assets/avatars/avatar-prof-flat-10.svg'
import Logo11 from '../assets/avatars/avatar-prof-flat-11.svg'
import Logo12 from '../assets/avatars/avatar-prof-flat-12.svg'
import Logo13 from '../assets/avatars/avatar-prof-flat-13.svg'
import Logo14 from '../assets/avatars/avatar-prof-flat-14.svg'
import Logo15 from '../assets/avatars/avatar-prof-flat-15.svg'
import Logo16 from '../assets/avatars/avatar-prof-flat-16.svg'
import Logo17 from '../assets/avatars/avatar-prof-flat-17.svg'
import Logo18 from '../assets/avatars/avatar-prof-flat-18.svg'
import Logo19 from '../assets/avatars/avatar-prof-flat-19.svg'
import Logo20 from '../assets/avatars/avatar-prof-flat-20.svg'

const nAvatars = 20
const avatars = [
    Logo1,
    Logo2,
    Logo3,
    Logo4,
    Logo5,
    Logo6,
    Logo7,
    Logo8,
    Logo9,
    Logo10,
    Logo11,
    Logo12,
    Logo13,
    Logo14,
    Logo15,
    Logo16,
    Logo17,
    Logo18,
    Logo19,
    Logo20
]

function stringToColor(string: string) {
    let hash = 0
    let i

    for (i = 0; i < string.length; i += 1) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash)
    }

    let color = '#'

    for (i = 0; i < 3; i += 1) {
        const value = (hash >> (i * 8)) & 0xff
        color += `00${value.toString(16)}`.substr(-2)
    }

    return color + "30" // add transparency to background colour
}

export function stringAvatar(name: string) {
    return {
        sx: {
            bgcolor: stringToColor(name)
        },
        children: name.split(' ')[0][0],
        src: avatars[name.charCodeAt(0) % nAvatars + name.charCodeAt(1) % nAvatars]
    }
}