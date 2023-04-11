import '../css/style.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { PixabayApi } from './pixabay-api';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import renderPhotoCards from '../templates/photo-card.hbs';
import Pagination from 'tui-pagination';
import 'tui-pagination/dist/tui-pagination.css';

const elements = {
  form: document.querySelector('.js-serch-form'),
  gallery: document.querySelector('.js-gallery'),
  tuiPagination: document.querySelector('.js-tui-pagination'),
}

const pixabayApi = new PixabayApi();

let totalPages = null;

const optionsPagination = { 
  totalItems: 0,
  itemsPerPage: 40,
  visiblePages: 10,
  page: 1,
  template: {
    page: '<a href="#" class="tui-page-btn">{{page}}</a>',
    currentPage: '<strong class="tui-page-btn tui-is-selected">{{page}}</strong>',
    moveButton:
      '<a href="#" class="tui-page-btn tui-{{type}}">' +
        '<span class="tui-ico-{{type}}">{{type}}</span>' +
      '</a>',
    disabledMoveButton:
      '<span class="tui-page-btn tui-is-disabled tui-{{type}}">' +
        '<span class="tui-ico-{{type}}">{{type}}</span>' +
      '</span>',
    moreButton:
      '<a href="#" class="tui-page-btn tui-{{type}}-is-ellip">' +
        '<span class="tui-ico-ellip">...</span>' +
      '</a>'
  }
};

const pagination = new Pagination(elements.tuiPagination, optionsPagination);
pagination.on('beforeMove', loadMore);




const optionsLightbox = {
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: 250,
}

let lightbox = new SimpleLightbox('.gallery a', optionsLightbox);

elements.form.addEventListener('submit', onSerchImages);

async function onSerchImages(event) {
  event.preventDefault();

  elements.tuiPagination.classList.add('is-hidden');
  elements.gallery.innerHTML = '';
  

  const { elements: { searchQuery } } = event.currentTarget;
  pixabayApi.searchQuery = searchQuery.value;

  try {
    const { data: { hits: photoCards, totalHits } } = await pixabayApi.getPhotoCards();

    totalPages = Math.floor(totalHits / pixabayApi.per_page);

    if (totalHits === 0 || photoCards.length === 0) {
      Notify.failure('Sorry, there are no images matching your search query. Please try again.');
      pagination.reset(0);
      return;
    }

    elements.gallery.insertAdjacentHTML('beforeend', renderPhotoCards(photoCards));
    Notify.success(`Hooray! We found ${totalHits} images.`);

    lightbox.refresh();

    if (totalPages > 1) {
      elements.tuiPagination.classList.remove('is-hidden');
      
      pagination.reset(totalHits);
      
    }
  
  } catch (error) {
    console.log(error);
  }

}

async function loadMore(event) {
  pixabayApi.page = event.page
  
  try {
    const { data: { hits: photoCards } } = await pixabayApi.getPhotoCards();

    elements.gallery.innerHTML = renderPhotoCards(photoCards);

    lightbox.refresh();
    
  } catch(error) {
    console.log(error.message);
  }
}