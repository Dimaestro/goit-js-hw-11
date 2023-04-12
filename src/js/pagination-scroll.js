import '../css/style.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { PixabayApi } from './pixabay-api';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import renderPhotoCards from '../templates/photo-card.hbs';

const elements = {
  form: document.querySelector('.js-serch-form'),
  gallery: document.querySelector('.js-gallery'),
  observer: document.querySelector('.js-observer'),
}

const pixabayApi = new PixabayApi();

let totalPages = null;

const optionsLightbox = {
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: 250,
}
let lightbox = new SimpleLightbox('.gallery a', optionsLightbox);

const options = {
  root: null,
  rootMargin: '0px 0px 600px 0px',
  threshold: 1.0
}
const observer = new IntersectionObserver(loadMore, options);

elements.form.addEventListener('submit', onSerchImages);

async function onSerchImages(event) {
  event.preventDefault();
  observer.unobserve(elements.observer);

  elements.gallery.innerHTML = '';
  pixabayApi.page = 1;

  const { elements: { searchQuery } } = event.currentTarget;
  pixabayApi.searchQuery = searchQuery.value;
  

  try {

    const { data: { hits: photoCards, totalHits } } = await pixabayApi.getPhotoCards();
    console.log(pixabayApi.page);
    
    totalPages = Math.floor(totalHits / pixabayApi.per_page);


    if (totalHits === 0 || photoCards.length === 0) {
      Notify.failure('Sorry, there are no images matching your search query. Please try again.');
      return;
    }

    elements.gallery.insertAdjacentHTML('beforeend', renderPhotoCards(photoCards));
    Notify.success(`Hooray! We found ${totalHits} images.`);

    lightbox.refresh();

    if (totalPages > 1) {
      setTimeout(() => {
        observer.observe(elements.observer);
      }, 500);
    }
  
  } catch (error) {
      console.log(error);
  }

}

async function loadMore(entries, observer) {

  if(entries[0].isIntersecting) {
    pixabayApi.page += 1;

    try {
      const { data: { hits: photoCards } } = await pixabayApi.getPhotoCards();
      console.log(pixabayApi.page);
      elements.gallery.insertAdjacentHTML('beforeend', renderPhotoCards(photoCards));
      
      lightbox.refresh();

      if (pixabayApi.page > totalPages) {
        observer.unobserve(elements.observer);
      }
      
    } catch(error) {
      console.log(error.message);
    }
  }
}