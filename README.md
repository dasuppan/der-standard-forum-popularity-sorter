# derStandard Forum Popularity Sorter
Recently, the very popular Austrian newspaper [derStandard](https://www.derstandard.at/) has put their forum posts behind a partial paywall. While users can still see the posts, the sorting of posts is unavailable unless one pays a monthly fee of 14,90€ for a "Standard Smart" subscription. Not only is this an absurdly high amount of money for such basic functionalities, users now also have to hope that pinned posts by forum moderators are somewhat representative of the overall discourse (which often times they are not and rather represent a specific view the newspaper/author wants to promote). This completely vibe-coded userscript shows two buttons near the forum header that act as a replacement for these two very basic features. Expect limitations for forums with a very high volume of top-level posts. Enjoy!

## Usage

### 1. Install TamperMonkey
Install TamperMonkey ([Firefox](https://addons.mozilla.org/de/firefox/addon/tampermonkey/), [Chrome](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)) or another userscript runner of your choice for your browser.

### 2. Import the script

Copy the contents of the userscript directly from this repo and paste it into a new userscript or go to *TamperMonkey dashboard -> Utilities -> Import from URL* and paste the following link:

```
https://raw.githubusercontent.com/dasuppan/der-standard-forum-popularity-sorter/refs/heads/main/der-standard-forum-popularity-sorter.js
```