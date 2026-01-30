// ===== DOM ELEMENTS =====
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');
const subTabs = document.querySelectorAll('.sub-tab');
const subTabContents = document.querySelectorAll('.sub-tab-content');
const header = document.querySelector('header');
const logo = document.querySelector('.logo');

// ===== TAB MANAGEMENT =====
class TabManager {
  constructor() {
    this.currentTab = 'current-affairs';
    this.init();
  }

  init() {
    // Initialize with Current Affairs tab active
    this.activateTab('current-affairs');
    
    // Add click events to tabs
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabId = tab.getAttribute('data-tab');
        this.switchTab(tabId);
      });
    });

    // Add click events to sub-tabs
    subTabs.forEach(subTab => {
      subTab.addEventListener('click', (e) => {
        const subTabId = subTab.getAttribute('data-sub-tab');
        const parentTab = e.target.closest('.tab-content').id;
        this.switchSubTab(parentTab, subTabId);
      });
    });
  }

  switchTab(tabId) {
    // Remove active class from all tabs
    tabs.forEach(tab => tab.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));

    // Add active class to clicked tab
    const activeTab = document.querySelector(`[data-tab="${tabId}"]`);
    const activeContent = document.getElementById(tabId);
    
    if (activeTab && activeContent) {
      activeTab.classList.add('active');
      activeContent.classList.add('active');
      this.currentTab = tabId;

      // Activate first sub-tab if exists
      const firstSubTab = activeContent.querySelector('.sub-tab');
      if (firstSubTab) {
        const firstSubTabId = firstSubTab.getAttribute('data-sub-tab');
        this.activateSubTab(firstSubTabId);
      }

      // Update URL without refresh
      history.pushState(null, null, `#${tabId}`);
      
      // Add animation
      this.animateTabSwitch(activeContent);
    }
  }

  switchSubTab(parentTab, subTabId) {
    const parentContent = document.getElementById(parentTab);
    if (!parentContent) return;

    // Remove active class from all sub-tabs in this parent
    parentContent.querySelectorAll('.sub-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    parentContent.querySelectorAll('.sub-tab-content').forEach(content => {
      content.classList.remove('active');
    });

    // Add active class to clicked sub-tab
    const activeSubTab = parentContent.querySelector(`[data-sub-tab="${subTabId}"]`);
    const activeSubContent = document.getElementById(subTabId);
    
    if (activeSubTab && activeSubContent) {
      activeSubTab.classList.add('active');
      activeSubContent.classList.add('active');
      
      // Add animation
      this.animateSubTabSwitch(activeSubContent);
    }
  }

  activateTab(tabId) {
    const tab = document.querySelector(`[data-tab="${tabId}"]`);
    if (tab) tab.click();
  }

  activateSubTab(subTabId) {
    const subTab = document.querySelector(`[data-sub-tab="${subTabId}"]`);
    if (subTab) subTab.click();
  }

  animateTabSwitch(element) {
    element.style.animation = 'none';
    setTimeout(() => {
      element.style.animation = 'fadeIn 0.5s ease';
    }, 10);
  }

  animateSubTabSwitch(element) {
    element.style.animation = 'none';
    setTimeout(() => {
      element.style.animation = 'fadeIn 0.5s ease';
    }, 10);
  }
}

// ===== STICKY HEADER =====
class StickyHeader {
  constructor() {
    this.lastScroll = 0;
    this.init();
  }

  init() {
    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;
      
      // Add shadow when scrolled
      if (currentScroll > 50) {
        header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2)';
        header.style.padding = '10px 0';
      } else {
        header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
        header.style.padding = '15px 0';
      }

      // Logo animation on scroll
      if (currentScroll > 100) {
        logo.style.transform = 'scale(0.9)';
      } else {
        logo.style.transform = 'scale(1)';
      }

      this.lastScroll = currentScroll;
    });
  }
}

// ===== SEARCH FUNCTIONALITY =====
class SearchManager {
  constructor() {
    this.init();
  }

  init() {
    this.createSearchBox();
    this.setupSearch();
  }

  createSearchBox() {
    const searchBox = document.createElement('div');
    searchBox.className = 'search-box';
    searchBox.innerHTML = `
      <div class="search-container">
        <input type="text" class="search-input" placeholder="Search notes...">
        <button class="search-btn">
          <i class="fas fa-search"></i>
        </button>
        <div class="search-results"></div>
      </div>
    `;
    
    // Add styles
    searchBox.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
    `;
    
    document.body.appendChild(searchBox);
  }

  setupSearch() {
    const searchInput = document.querySelector('.search-input');
    const searchResults = document.querySelector('.search-results');
    const searchBtn = document.querySelector('.search-btn');

    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      if (query.length >= 2) {
        this.performSearch(query);
      } else {
        searchResults.style.display = 'none';
      }
    });

    searchBtn.addEventListener('click', () => {
      const query = searchInput.value.toLowerCase().trim();
      if (query) {
        this.performSearch(query);
      }
    });

    // Close search results when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-container')) {
        searchResults.style.display = 'none';
      }
    });
  }

  performSearch(query) {
    const results = this.searchContent(query);
    this.displayResults(results, query);
  }

  searchContent(query) {
    const results = [];
    const contentElements = document.querySelectorAll('h2, h3, h4, p, li, .topic-card, .category-card');
    
    contentElements.forEach(element => {
      const text = element.textContent.toLowerCase();
      if (text.includes(query)) {
        const parentCard = element.closest('.content-card, .topic-card, .category-card');
        if (parentCard) {
          const title = element.closest('h2, h3, h4')?.textContent || 'Content';
          const excerpt = element.textContent.substring(0, 100) + '...';
          const tab = this.findParentTab(parentCard);
          
          results.push({
            title,
            excerpt,
            element: parentCard,
            tab
          });
        }
      }
    });
    
    return results.slice(0, 10); // Limit to 10 results
  }

  findParentTab(element) {
    let parent = element;
    while (parent && !parent.classList.contains('tab-content')) {
      parent = parent.parentElement;
    }
    return parent ? parent.id : null;
  }

  displayResults(results, query) {
    const searchResults = document.querySelector('.search-results');
    
    if (results.length === 0) {
      searchResults.innerHTML = '<div class="search-result-item">No results found</div>';
    } else {
      searchResults.innerHTML = results.map((result, index) => `
        <div class="search-result-item" data-index="${index}">
          <strong>${this.highlightText(result.title, query)}</strong>
          <p style="margin: 5px 0; font-size: 14px; color: var(--gray);">
            ${this.highlightText(result.excerpt, query)}
          </p>
          <small style="color: var(--primary-light);">${result.tab}</small>
        </div>
      `).join('');
      
      // Add click events to result items
      searchResults.querySelectorAll('.search-result-item').forEach((item, index) => {
        item.addEventListener('click', () => {
          this.navigateToResult(results[index]);
        });
      });
    }
    
    searchResults.style.display = 'block';
  }

  highlightText(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
  }

  navigateToResult(result) {
    // Switch to the appropriate tab
    if (result.tab) {
      const tabManager = new TabManager();
      tabManager.switchTab(result.tab);
      
      // Scroll to the element with highlight
      setTimeout(() => {
        result.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Add highlight effect
        result.element.style.animation = 'none';
        setTimeout(() => {
          result.element.style.boxShadow = '0 0 0 3px rgba(255, 107, 107, 0.5)';
          result.element.style.transition = 'box-shadow 0.3s ease';
          
          setTimeout(() => {
            result.element.style.boxShadow = '';
          }, 2000);
        }, 300);
      }, 500);
    }
    
    // Hide search results
    document.querySelector('.search-results').style.display = 'none';
  }
}

// ===== PRINT & DOWNLOAD =====
class PrintDownloadManager {
  constructor() {
    this.init();
  }

  init() {
    this.createToolbar();
  }

  createToolbar() {
    const toolbar = document.createElement('div');
    toolbar.className = 'print-toolbar';
    toolbar.innerHTML = `
      <button class="print-btn" title="Print Notes">
        <i class="fas fa-print"></i>
      </button>
      <button class="download-btn" title="Download as PDF">
        <i class="fas fa-download"></i>
      </button>
      <button class="dark-mode-btn" title="Toggle Dark Mode">
        <i class="fas fa-moon"></i>
      </button>
    `;
    
    toolbar.style.cssText = `
      position: fixed;
      bottom: 30px;
      right: 30px;
      display: flex;
      gap: 10px;
      z-index: 999;
    `;
    
    document.body.appendChild(toolbar);
    
    // Add event listeners
    this.addEventListeners();
  }

  addEventListeners() {
    // Print button
    document.querySelector('.print-btn').addEventListener('click', () => {
      this.printCurrentTab();
    });
    
    // Download button
    document.querySelector('.download-btn').addEventListener('click', () => {
      this.downloadAsPDF();
    });
    
    // Dark mode button
    document.querySelector('.dark-mode-btn').addEventListener('click', () => {
      this.toggleDarkMode();
    });
  }

  printCurrentTab() {
    const activeContent = document.querySelector('.tab-content.active');
    if (activeContent) {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>TGPSC Notes - Print</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; }
              .print-content { max-width: 800px; margin: 0 auto; }
              h1, h2, h3 { color: #0c4b8a; }
              ul { margin-left: 20px; }
              @media print {
                .no-print { display: none; }
                body { -webkit-print-color-adjust: exact; }
              }
            </style>
          </head>
          <body>
            <div class="print-content">
              ${activeContent.innerHTML}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  }

  downloadAsPDF() {
    // This would typically use a PDF generation library
    alert('PDF download feature requires server-side implementation.\nFor now, please use the print function and save as PDF.');
  }

  toggleDarkMode() {
    const body = document.body;
    const isDark = body.classList.toggle('dark-mode');
    const icon = document.querySelector('.dark-mode-btn i');
    
    if (isDark) {
      icon.className = 'fas fa-sun';
      localStorage.setItem('theme', 'dark');
    } else {
      icon.className = 'fas fa-moon';
      localStorage.setItem('theme', 'light');
    }
  }
}

// ===== ANIMATION MANAGER =====
class AnimationManager {
  constructor() {
    this.init();
  }

  init() {
    this.setupIntersectionObserver();
    this.setupHoverEffects();
  }

  setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          
          // Add specific animations based on element type
          if (entry.target.classList.contains('category-section')) {
            entry.target.style.animation = 'slideUp 0.6s ease';
          } else if (entry.target.classList.contains('topic-card')) {
            entry.target.style.animation = 'fadeInUp 0.5s ease';
          }
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    // Observe all content cards
    document.querySelectorAll('.category-section, .topic-card, .exam-card').forEach(el => {
      observer.observe(el);
    });
  }

  setupHoverEffects() {
    // Add hover effects to interactive elements
    const hoverElements = document.querySelectorAll('.tab, .sub-tab, .category-card, .topic-list li');
    
    hoverElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'translateY(-3px)';
      });
      
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'translateY(0)';
      });
    });
  }
}

// ===== PROGRESS TRACKER =====
class ProgressTracker {
  constructor() {
    this.visitedTabs = new Set();
    this.init();
  }

  init() {
    // Load saved progress
    this.loadProgress();
    
    // Mark current affairs as visited by default
    this.visitedTabs.add('current-affairs');
    
    // Track tab visits
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabId = tab.getAttribute('data-tab');
        this.markAsVisited(tabId);
      });
    });

    // Track sub-tab visits
    subTabs.forEach(subTab => {
      subTab.addEventListener('click', () => {
        const subTabId = subTab.getAttribute('data-sub-tab');
        this.markAsVisited(subTabId);
      });
    });

    // Create progress bar
    this.createProgressBar();
  }

  createProgressBar() {
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    document.body.appendChild(progressBar);
    
    // Update progress
    this.updateProgress();
  }

  markAsVisited(id) {
    this.visitedTabs.add(id);
    localStorage.setItem('visitedTabs', JSON.stringify([...this.visitedTabs]));
    this.updateProgress();
  }

  updateProgress() {
    const totalItems = tabs.length + subTabs.length;
    const progress = (this.visitedTabs.size / totalItems) * 100;
    
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }
  }

  loadProgress() {
    const saved = localStorage.getItem('visitedTabs');
    if (saved) {
      this.visitedTabs = new Set(JSON.parse(saved));
    }
  }
}

// ===== BOOKMARK SYSTEM =====
class BookmarkManager {
  constructor() {
    this.bookmarks = new Set();
    this.init();
  }

  init() {
    this.loadBookmarks();
    this.addBookmarkButtons();
  }

  addBookmarkButtons() {
    // Add bookmark button to each content section
    document.querySelectorAll('.topic-card, .category-section').forEach(section => {
      const heading = section.querySelector('h3, h4');
      if (heading) {
        const bookmarkBtn = document.createElement('button');
        bookmarkBtn.className = 'bookmark-btn';
        bookmarkBtn.innerHTML = '<i class="far fa-bookmark"></i>';
        bookmarkBtn.title = 'Bookmark this section';
        
        section.style.position = 'relative';
        section.appendChild(bookmarkBtn);
        
        bookmarkBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggleBookmark(section, heading.textContent);
        });
        
        // Update icon if already bookmarked
        if (this.bookmarks.has(heading.textContent)) {
          bookmarkBtn.innerHTML = '<i class="fas fa-bookmark" style="color: var(--accent);"></i>';
        }
      }
    });
  }

  toggleBookmark(section, title) {
    const bookmarkBtn = section.querySelector('.bookmark-btn');
    
    if (this.bookmarks.has(title)) {
      this.bookmarks.delete(title);
      bookmarkBtn.innerHTML = '<i class="far fa-bookmark"></i>';
    } else {
      this.bookmarks.add(title);
      bookmarkBtn.innerHTML = '<i class="fas fa-bookmark" style="color: var(--accent);"></i>';
      this.showNotification(`"${title}" bookmarked!`);
    }
    
    this.saveBookmarks();
  }

  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideUp 0.3s ease reverse';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  saveBookmarks() {
    localStorage.setItem('bookmarks', JSON.stringify([...this.bookmarks]));
  }

  loadBookmarks() {
    const saved = localStorage.getItem('bookmarks');
    if (saved) {
      this.bookmarks = new Set(JSON.parse(saved));
    }
  }
}

// ===== INITIALIZE ALL FEATURES =====
document.addEventListener('DOMContentLoaded', function() {
  // Initialize all managers
  const tabManager = new TabManager();
  const stickyHeader = new StickyHeader();
  const progressTracker = new ProgressTracker();
  const searchManager = new SearchManager();
  const printManager = new PrintDownloadManager();
  const animationManager = new AnimationManager();
  const bookmarkManager = new BookmarkManager();
  
  // Load dark mode preference
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    const icon = document.querySelector('.dark-mode-btn i');
    if (icon) icon.className = 'fas fa-sun';
  }
  
  // Handle URL hash on page load
  if (window.location.hash) {
    const tabId = window.location.hash.substring(1);
    if (tabId && document.getElementById(tabId)) {
      setTimeout(() => tabManager.activateTab(tabId), 100);
    }
  }
  
  // Add keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl + F for search
    if (e.ctrlKey && e.key === 'f') {
      e.preventDefault();
      document.querySelector('.search-input').focus();
    }
    
    // Escape to clear search
    if (e.key === 'Escape') {
      document.querySelector('.search-input').value = '';
      document.querySelector('.search-results').style.display = 'none';
    }
  });
  
  console.log('TGPSC Notes Professional Edition loaded successfully!');
});