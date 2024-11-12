let articlesData = [];
let currentCategory = "World";

const themeToggleButton = document.getElementById('theme-toggle');
const bodyElement = document.body;

const currentTheme = localStorage.getItem('theme') || 'light';
applyTheme(currentTheme);

function applyTheme(theme) {
    if (theme === 'dark') {
        bodyElement.classList.add('dark-theme');
        themeToggleButton.textContent = "Light Mode";
    } else {
        bodyElement.classList.remove('dark-theme');
        themeToggleButton.textContent = "Dark Mode";
    }
    localStorage.setItem('theme', theme);
}

themeToggleButton.addEventListener('click', () => {
    const newTheme = bodyElement.classList.contains('dark-theme') ? 'light' : 'dark';
    applyTheme(newTheme);
});

function calculateReadingTime(wordCount) {
    const readingSpeed = 200;
    return Math.ceil(wordCount / readingSpeed);
}

// Fetch Articles from JSON
fetch('articles.json')
    .then(response => response.json())
    .then(articles => {
        articlesData = articles;
        applySortingAndDisplay();
        setupCategoryFilter();
        displayInterestingArticles(); // Display articles in sidebar based on initial category
    })
    .catch(error => console.error('Error fetching articles:', error));

// Sorting Functionality
document.getElementById('sort-by').addEventListener('change', applySortingAndDisplay);

function applySortingAndDisplay() {
    const sortBy = document.getElementById('sort-by').value;
    
    const filteredArticles = currentCategory === "World"
        ? articlesData
        : articlesData.filter(article => article.category === currentCategory);

    const sortedArticles = [...filteredArticles].sort((a, b) => {
        return sortBy === 'date'
            ? new Date(b.date) - new Date(a.date)
            : b.views - a.views;
    });

    displayMostPopularArticle(sortedArticles);
    displayArticles(sortedArticles);
    displayInterestingArticles(); // Update sidebar when sorting changes
}

function displayMostPopularArticle(articles) {
    const mostPopularContainer = document.getElementById('most-popular-article');
    if (!articles.length) {
        mostPopularContainer.innerHTML = '<p>No articles available.</p>';
        return;
    }

    const mostPopularArticle = articles.reduce((prev, current) => (prev.views > current.views) ? prev : current);
    const readingTime = calculateReadingTime(mostPopularArticle.wordCount);

    mostPopularContainer.innerHTML = `
        <div class="card mb-3 most-popular-card" style="background-image: url('${mostPopularArticle.image}');">
            <div class="card-body">
                <h5 class="card-title">${mostPopularArticle.title}</h5>
                <p class="card-text text-muted">${mostPopularArticle.date} | <span class="views-count" data-article-id="${mostPopularArticle.id}">${mostPopularArticle.views}</span> views | ${readingTime} min read</p>
                <p class="card-text">${mostPopularArticle.content.substring(0, 100)}...</p>
                <button class="btn btn-primary btn-sm read-more-btn" data-article-id="${mostPopularArticle.id}">Read More</button>
            </div>
        </div>
    `;
}

function displayInterestingArticles() {
    const interestingArticlesContainer = document.getElementById('interesting-articles-container');
    interestingArticlesContainer.innerHTML = '';

    const filteredArticles = currentCategory === "World"
        ? articlesData
        : articlesData.filter(article => article.category === currentCategory);

    const interestingArticles = filteredArticles.slice(6, 10);
    interestingArticles.forEach(article => {
        const articleItem = document.createElement('div');
        articleItem.classList.add('list-group-item', 'article-item');
        articleItem.setAttribute('data-article-id', article.id);

        articleItem.innerHTML = `
            <div class="media">
                <img src="${article.image}" class="mr-3" alt="${article.title}" width="60">
                <div class="media-body">
                    <h5 class="mt-0 article-title">${article.title}</h5>
                </div>
            </div>
        `;

        interestingArticlesContainer.appendChild(articleItem);
        articleItem.addEventListener('click', () => {
            showAdditionalInfo(article);
        });
    });
}

function displayArticles(articles) {
    const featuredContainer = document.getElementById('featured-article');
    const topStoriesContainer = document.getElementById('top-stories');
    const moreArticlesContainer = document.getElementById('right-sidebar-articles');
    const additionalFeaturedContainer = document.getElementById('additional-featured-articles');

    featuredContainer.innerHTML = '';
    topStoriesContainer.innerHTML = '';
    moreArticlesContainer.innerHTML = '';
    additionalFeaturedContainer.innerHTML = '';

    if (!articles.length) {
        topStoriesContainer.innerHTML = '<p>No articles available for this category.</p>';
        return;
    }

    const [featuredArticle, ...remainingArticles] = articles;
    const featuredReadingTime = calculateReadingTime(featuredArticle.wordCount);

     // TopStory
     remainingArticles.slice(0, 3).forEach(article => {
        const readingTime = calculateReadingTime(article.wordCount);
        topStoriesContainer.innerHTML += `
            <div class="card mb-3">
                <img src="${article.image}" class="card-img-top" alt="${article.title}">
                <div class="card-body">
                    <h5 class="card-title">${article.title}</h5>
                    <p class="card-text text-muted">${article.date} | <span class="views-count" data-article-id="${article.id}">${article.views}</span> views | ${readingTime} min read</p>
                    <p class="card-text">${article.content.substring(0, 50)}...</p>
                    <button class="btn btn-primary btn-sm read-more-btn" data-article-id="${article.id}">Read More</button>
                </div>
            </div>`
        ;
    });

    // Display the next set of 3 articles in More Articles
    remainingArticles.slice(3, 6).forEach(article => {
        const readingTime = calculateReadingTime(article.wordCount);
        moreArticlesContainer.innerHTML += `
            <div class="card mb-3">
                <img src="${article.image}" class="card-img-top" alt="${article.title}">
                <div class="card-body">
                    <h5 class="card-title">${article.title}</h5>
                    <p class="card-text text-muted">${article.date} | <span class="views-count" data-article-id="${article.id}">${article.views}</span> views | ${readingTime} min read</p>
                    <p class="card-text">${article.content.substring(0, 50)}...</p>
                    <button class="btn btn-primary btn-sm read-more-btn" data-article-id="${article.id}">Read More</button>
                </div>
            </div>`
        ;
    });
    // FeatureArticle
    featuredContainer.innerHTML = `
        <div class="card mb-3">
            <img src="${featuredArticle.image}" class="card-img-top" alt="${featuredArticle.title}">
            <div class="card-body">
                <h5 class="card-title">${featuredArticle.title}</h5>
                <p class="card-text text-muted">${featuredArticle.date} | <span class="views-count" data-article-id="${featuredArticle.id}">${featuredArticle.views}</span> views | ${featuredReadingTime} min read</p>
                <p class="card-text">${featuredArticle.content.substring(0, 100)}...</p>
                <button class="btn btn-primary btn-sm read-more-btn" data-article-id="${featuredArticle.id}">Read More</button>
            </div>
        </div>
    `;
}




function showAdditionalInfo(article) {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalContentBody = document.getElementById('modal-content-body');

    modalContentBody.innerHTML = `
        <h5>${article.title}</h5>
        <p>${article.date} | <span>${article.views}</span> views | ${calculateReadingTime(article.wordCount)} min read</p>
        <div class="image-container pb-3">
            <img class="con-image" src="${article.image}" alt="${article.title}">
        </div>
        <p>${article.content}</p>
    `;

    modalOverlay.style.display = 'flex';
    article.views += 1;
    document.querySelectorAll(`.views-count[data-article-id="${article.id}"]`).forEach(element => {
        element.textContent = article.views;
    });
}

document.getElementById('modal-close-btn').addEventListener('click', () => {
    document.getElementById('modal-overlay').style.display = 'none';
});

document.addEventListener('click', (event) => {
    if (event.target.classList.contains('read-more-btn')) {
        const articleId = parseInt(event.target.getAttribute('data-article-id'));
        const article = articlesData.find(a => a.id === articleId);
        
        if (article) {
            showAdditionalInfo(article);
        }
    }
});

function setupCategoryFilter() {
    document.querySelectorAll('.category-link').forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            currentCategory = event.target.getAttribute('data-category');

            applySortingAndDisplay(); // Updates main articles display
            displayInterestingArticles(); // Updates sidebar articles based on category
        });
    });
}
