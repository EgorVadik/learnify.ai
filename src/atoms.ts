import { atom } from 'jotai'

export const markdownAtom = atom<string>('')
export const currentFileAtom = atom<string | null>(null)
