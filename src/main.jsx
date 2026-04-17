import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from './store/store'
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import "bootstrap-icons/font/bootstrap-icons.css";
import ScrollToTop from "./components/ui/ScrollToTop.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ScrollToTop />
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>
)