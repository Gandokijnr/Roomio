<template>
  <footer class="landing-footer">
    <div class="footer-container">
      <!-- Main Footer Content -->
      <div class="footer-main">
        <div class="footer-brand">
          <h3 class="brand-name">🏨 Roomio</h3>
          <p class="brand-description">
            The complete hotel management solution trusted by thousands of hotels worldwide. 
            Transform your operations, reduce costs, and delight your guests.
          </p>
          <div class="social-links">
            <a href="#" class="social-link" aria-label="Facebook">📘</a>
            <a href="#" class="social-link" aria-label="Twitter">🐦</a>
            <a href="#" class="social-link" aria-label="LinkedIn">💼</a>
            <a href="#" class="social-link" aria-label="Instagram">📷</a>
          </div>
        </div>
        
        <div class="footer-links">
          <div class="link-group">
            <h4 class="link-title">Product</h4>
            <ul class="link-list">
              <li><a href="#features" @click="scrollTo('features')">Features</a></li>
              <li><a href="#benefits" @click="scrollTo('benefits')">Benefits</a></li>
              <li><a href="#pricing" @click="scrollTo('pricing')">Pricing</a></li>
              <li><a href="#" @click="requestDemo">Demo</a></li>
              <li><a href="#" @click="openIntegrations">Integrations</a></li>
            </ul>
          </div>
          
          <div class="link-group">
            <h4 class="link-title">Solutions</h4>
            <ul class="link-list">
              <li><a href="#" @click="openSolution('small-hotels')">Small Hotels</a></li>
              <li><a href="#" @click="openSolution('boutique')">Boutique Hotels</a></li>
              <li><a href="#" @click="openSolution('chains')">Hotel Chains</a></li>
              <li><a href="#" @click="openSolution('resorts')">Resorts</a></li>
              <li><a href="#" @click="openSolution('bnb')">B&B / Inns</a></li>
            </ul>
          </div>
          
          <div class="link-group">
            <h4 class="link-title">Resources</h4>
            <ul class="link-list">
              <li><a href="#" @click="openResource('blog')">Blog</a></li>
              <li><a href="#" @click="openResource('help')">Help Center</a></li>
              <li><a href="#" @click="openResource('guides')">Setup Guides</a></li>
              <li><a href="#" @click="openResource('webinars')">Webinars</a></li>
              <li><a href="#" @click="openResource('case-studies')">Case Studies</a></li>
            </ul>
          </div>
          
          <div class="link-group">
            <h4 class="link-title">Company</h4>
            <ul class="link-list">
              <li><a href="#" @click="openPage('about')">About Us</a></li>
              <li><a href="#" @click="openPage('careers')">Careers</a></li>
              <li><a href="#" @click="openPage('contact')">Contact</a></li>
              <li><a href="#" @click="openPage('partners')">Partners</a></li>
              <li><a href="#" @click="openPage('press')">Press</a></li>
            </ul>
          </div>
        </div>
        
        <div class="footer-contact">
          <h4 class="contact-title">Get in Touch</h4>
          <div class="contact-info">
            <div class="contact-item">
              <span class="contact-icon">📞</span>
              <div class="contact-details">
                <strong>Sales & Support</strong>
                <a href="tel:+1-800-ROOMIO-1" class="contact-link">1-800-ROOMIO-1</a>
              </div>
            </div>
            
            <div class="contact-item">
              <span class="contact-icon">✉️</span>
              <div class="contact-details">
                <strong>Email Support</strong>
                <a href="mailto:support@roomio.com" class="contact-link">support@roomio.com</a>
              </div>
            </div>
            
            <div class="contact-item">
              <span class="contact-icon">💬</span>
              <div class="contact-details">
                <strong>Live Chat</strong>
                <button @click="openChat" class="chat-button">Start Chat</button>
              </div>
            </div>
          </div>
          
          <!-- Newsletter Signup -->
          <div class="newsletter">
            <h5 class="newsletter-title">Stay Updated</h5>
            <p class="newsletter-description">Get the latest hotel management tips and product updates.</p>
            <div class="newsletter-form">
              <input 
                v-model="newsletterEmail" 
                type="email" 
                placeholder="Enter your email"
                class="newsletter-input"
                @keyup.enter="subscribeNewsletter"
              />
              <button @click="subscribeNewsletter" class="newsletter-button">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Trust Badges -->
      <div class="trust-section">
        <div class="trust-badges">
          <div class="trust-badge">
            <span class="badge-icon">🔒</span>
            <span class="badge-text">SOC 2 Certified</span>
          </div>
          <div class="trust-badge">
            <span class="badge-icon">🛡️</span>
            <span class="badge-text">PCI Compliant</span>
          </div>
          <div class="trust-badge">
            <span class="badge-icon">🌐</span>
            <span class="badge-text">GDPR Ready</span>
          </div>
          <div class="trust-badge">
            <span class="badge-icon">☁️</span>
            <span class="badge-text">99.9% Uptime</span>
          </div>
        </div>
      </div>
      
      <!-- Footer Bottom -->
      <div class="footer-bottom">
        <div class="footer-legal">
          <p class="copyright">
            © {{ currentYear }} Roomio. All rights reserved.
          </p>
          <div class="legal-links">
            <a href="#" @click="openLegal('privacy')" class="legal-link">Privacy Policy</a>
            <a href="#" @click="openLegal('terms')" class="legal-link">Terms of Service</a>
            <a href="#" @click="openLegal('cookies')" class="legal-link">Cookie Policy</a>
            <a href="#" @click="openLegal('security')" class="legal-link">Security</a>
          </div>
        </div>
        
        <div class="footer-cta">
          <p class="cta-text">Ready to get started?</p>
          <button @click="scrollTo('pricing')" class="footer-cta-button">
            Start Free Trial
            <span class="button-arrow">→</span>
          </button>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const newsletterEmail = ref('')
const currentYear = new Date().getFullYear()

const scrollTo = (elementId: string) => {
  const element = document.getElementById(elementId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

const requestDemo = () => {
  scrollTo('pricing')
}

const openIntegrations = () => {
  console.log('Open integrations page')
  // Navigate to integrations page
}

const openSolution = (solution: string) => {
  console.log('Open solution:', solution)
  // Navigate to specific solution page
}

const openResource = (resource: string) => {
  console.log('Open resource:', resource)
  // Navigate to specific resource
}

const openPage = (page: string) => {
  console.log('Open page:', page)
  // Navigate to specific page
}

const openChat = () => {
  console.log('Open live chat')
  // Open live chat widget
}

const subscribeNewsletter = () => {
  if (newsletterEmail.value && isValidEmail(newsletterEmail.value)) {
    console.log('Subscribe to newsletter:', newsletterEmail.value)
    // Handle newsletter subscription
    alert('Thank you for subscribing! You\'ll receive our latest updates.')
    newsletterEmail.value = ''
  } else {
    alert('Please enter a valid email address.')
  }
}

const openLegal = (page: string) => {
  console.log('Open legal page:', page)
  // Navigate to legal page
}

const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
</script>

<style scoped>
.landing-footer {
  background: #1f2937;
  color: white;
  padding: 4rem 0 0;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.footer-main {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 3rem;
  margin-bottom: 3rem;
}

.footer-brand {
  max-width: 300px;
}

.brand-name {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: white;
}

.brand-description {
  color: #d1d5db;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
}

.social-links {
  display: flex;
  gap: 1rem;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #374151;
  border-radius: 50%;
  text-decoration: none;
  font-size: 1.25rem;
  transition: all 0.3s ease;
}

.social-link:hover {
  background: #d4af37;
  transform: translateY(-2px);
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
}

.link-title {
  font-size: 1rem;
  font-weight: 600;
  color: white;
  margin-bottom: 1rem;
}

.link-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.link-list li {
  margin-bottom: 0.5rem;
}

.link-list a {
  color: #d1d5db;
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.3s ease;
  cursor: pointer;
}

.link-list a:hover {
  color: #d4af37;
}

.footer-contact {
  max-width: 300px;
}

.contact-title {
  font-size: 1rem;
  font-weight: 600;
  color: white;
  margin-bottom: 1rem;
}

.contact-info {
  margin-bottom: 2rem;
}

.contact-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.contact-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.contact-details strong {
  display: block;
  color: white;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.contact-link {
  color: #d4af37;
  text-decoration: none;
  font-size: 0.875rem;
}

.contact-link:hover {
  text-decoration: underline;
}

.chat-button {
  background: #d4af37;
  color: white;
  border: none;
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: background 0.3s ease;
}

.chat-button:hover {
  background: #b8931f;
}

.newsletter {
  padding-top: 1.5rem;
  border-top: 1px solid #374151;
}

.newsletter-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  margin-bottom: 0.5rem;
}

.newsletter-description {
  color: #d1d5db;
  font-size: 0.75rem;
  margin-bottom: 1rem;
}

.newsletter-form {
  display: flex;
  gap: 0.5rem;
}

.newsletter-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #374151;
  border-radius: 0.25rem;
  background: #374151;
  color: white;
  font-size: 0.875rem;
}

.newsletter-input::placeholder {
  color: #9ca3af;
}

.newsletter-button {
  background: #d4af37;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease;
}

.newsletter-button:hover {
  background: #b8931f;
}

.trust-section {
  padding: 2rem 0;
  border-top: 1px solid #374151;
  border-bottom: 1px solid #374151;
  margin-bottom: 2rem;
}

.trust-badges {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.trust-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #374151;
  border-radius: 0.5rem;
}

.badge-icon {
  font-size: 1.25rem;
}

.badge-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: #d1d5db;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 0;
}

.footer-legal {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.copyright {
  color: #9ca3af;
  font-size: 0.875rem;
  margin: 0;
}

.legal-links {
  display: flex;
  gap: 1.5rem;
}

.legal-link {
  color: #d1d5db;
  text-decoration: none;
  font-size: 0.875rem;
  cursor: pointer;
  transition: color 0.3s ease;
}

.legal-link:hover {
  color: #d4af37;
}

.footer-cta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.cta-text {
  color: #d1d5db;
  font-size: 0.875rem;
  margin: 0;
}

.footer-cta-button {
  background: #d4af37;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.footer-cta-button:hover {
  background: #b8931f;
  transform: translateY(-1px);
}

.button-arrow {
  transition: transform 0.3s ease;
}

.footer-cta-button:hover .button-arrow {
  transform: translateX(4px);
}

/* Mobile Styles */
@media (max-width: 768px) {
  .footer-main {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .footer-links {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
  
  .footer-bottom {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .footer-legal {
    flex-direction: column;
    gap: 1rem;
  }
  
  .legal-links {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .trust-badges {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  .newsletter-form {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .footer-links {
    grid-template-columns: 1fr;
  }
  
  .trust-badges {
    flex-direction: column;
    align-items: center;
  }
}
</style>
