export default class BtnUp {
  constructor(element) {
    this.element = element;
  }

  show() {
    this.element.classList.remove('btn-up-hide');
  }

  hide() {
    this.element.classList.add('btn-up-hide');
  }

  addEventListenerBtn() {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      scrollY > 800 ? this.show() : this.hide();
    })

    this.element.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    })
  }
}