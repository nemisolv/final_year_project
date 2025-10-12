import {APP} from '@/lib/constants'

export const Footer = () => {
    return (
        <footer className="hidden lg:block h-20 w-full border-t-2 border-slate-200 p-2">
            <div className="max-w-screen-lg mx-auto flex items-center justify-evenly h-full">
                <p>
                    &copy; {new Date().getFullYear()} {APP.name} . All rights reserved.
                </p>
            </div>
        </footer>
    )
}