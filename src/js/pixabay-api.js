import axios from "axios";

export class PixabayApi {
  static BASE_URL = 'https://pixabay.com';
  static MY_KEY = '35165988-8e973c9c524519319564ce133';

  constructor() {
    this.page = 1;
    this.searchQuery = null;
    this.per_page = 40;
  };

  getPhotoCards() {
    const options = {
      params: {
        key: PixabayApi.MY_KEY,
        q: this.searchQuery,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        per_page: this.per_page,
        page: this.page,
      }
    }

    return axios.get(`${PixabayApi.BASE_URL}/api?`, options);    
  }
}
