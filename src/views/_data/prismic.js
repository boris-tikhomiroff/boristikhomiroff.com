require('dotenv').config();

const prismicH = require('@prismicio/helpers');
const prismic = require('@prismicio/client');
const axios = require('axios');

const PRISMIC_REPO = process.env.PRISMIC_ENDPOINT;
const PRISMIC_TOKEN = process.env.PRISMIC_ACCESS_TOKEN;

const axiosAdapter = async (url, options = {}) => {
  try {
    const response = await axios({ url, ...options });
    return {
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      statusText: response.statusText,
      json: () => Promise.resolve(response.data),
    };
  } catch (error) {
    if (error.response) {
      return {
        ok: false,
        status: error.response.status,
        statusText: error.response.statusText,
        json: () => Promise.resolve(error.response.data),
      };
    }
    throw error;
  }
};

const client = prismic.createClient(PRISMIC_REPO, {
  accessToken: PRISMIC_TOKEN,
  fetch: axiosAdapter,
});

/**
 * Fetches the Prismic API and returns the response as JSON
 */

const fetchHome = async () => client.getSingle('home');

const fetchProducts = async () => {
  return client.getAllByType('product');
};

async function fetchPrismicData() {
  const [homeData, product] = await Promise.all([fetchHome(), fetchProducts()]);

  console.log('------------ HERE ------------', product);

  const homeGallery = await product.map(item => {
    return {
      id: item.id,
      href: item.href,
      title: item.data.title,
      image: item.data.image.url,
      uid: item.uid,
    };
  });

  const home = {
    ...homeData,
    gallery: homeGallery,
  };

  const data = {
    home,
    ...prismic,
  };

  // console.log('------------ HERE ------------', data.home);

  return data;
}

module.exports = fetchPrismicData;
