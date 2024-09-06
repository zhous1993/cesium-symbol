import { Directive } from "vue"

const vMove: Directive<any, void> = (el: HTMLElement) => {
    // let moveElement = el.firstElementChild as HTMLElement
    function mouseDown(e: MouseEvent) {
        let X = e.clientX - el.offsetLeft
        let Y = e.clientY - el.offsetTop
        function mouseMove(e: MouseEvent) {
            el.style.left = e.clientX - X + 'px'
            el.style.top = e.clientY - Y + 'px'
        }
        document.addEventListener('mousemove', mouseMove)
        document.addEventListener('mouseup', () => {
            document.removeEventListener('mousemove', mouseMove)
        })
    }
    el.addEventListener('mousedown', mouseDown)
}

export default vMove