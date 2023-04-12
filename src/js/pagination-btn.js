import '../css/style.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { PixabayApi } from './pixabay-api';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import renderPhotoCards from '../templates/photo-card.hbs';
import BtnUp from './btnUp';

const elements = {
  form: document.querySelector('.js-serch-form'),
  gallery: document.querySelector('.js-gallery'),
  btnLoad: document.querySelector('.js-btn-load'),
  btnUp: document.querySelector('.js-btn-up'),
}

const pixabayApi = new PixabayApi();

let totalPages = null;

const optionsLightbox = {
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: 250,
}

let lightbox = new SimpleLightbox('.gallery a', optionsLightbox);

const btnUp = new BtnUp(elements.btnUp);
console.log(btnUp);


elements.form.addEventListener('submit', onSerchImages);

async function onSerchImages(event) {
  event.preventDefault();

  pixabayApi.page = 1;
  elements.btnLoad.classList.add('is-hidden');
  elements.gallery.innerHTML = '';
  
  const { elements: { searchQuery } } = event.currentTarget;
  pixabayApi.searchQuery = searchQuery.value;
  

  try {
    const { data: { hits: photoCards, totalHits } } = await pixabayApi.getPhotoCards();

    totalPages = Math.floor(totalHits / pixabayApi.per_page);

    if (totalHits === 0 || photoCards.length === 0) {
      Notify.failure('Sorry, there are no images matching your search query. Please try again.');
      return;
    }

    elements.gallery.insertAdjacentHTML('beforeend', renderPhotoCards(photoCards));
    Notify.success(`Hooray! We found ${totalHits} images.`);

    lightbox.refresh();

    btnUp.addEventListenerBtn();
    
    if (totalPages > 1) {
      elements.btnLoad.classList.remove('is-hidden');
      elements.btnLoad.addEventListener('click', loadMore);
    }
  
  } catch (error) {
    console.log(error);
  }

}

async function loadMore() {
  pixabayApi.page += 1
  
  try {
    const { data: { hits: photoCards } } = await pixabayApi.getPhotoCards();
  
    elements.gallery.insertAdjacentHTML('beforeend', renderPhotoCards(photoCards));

    lightbox.refresh();

    if (pixabayApi.page > totalPages) {
      elements.btnLoad.classList.add('is-hidden');
      elements.btnLoad.removeEventListener('click', loadMore);
    }
    
  } catch(error) {
    console.log(error.message);
  }
}