# Skåne status map (Google Sheets version)

A shared map of Skåne's 23 härader and the 10 towns that had their own court, where tapping an area moves it up one step: <20% (some coverage, not being worked on), pågående (being worked on, under 20%), then 20, 40, 60, 80 and 100%. A **Download JPEG** button saves an image of the map with the status key. The page is hosted on GitHub Pages, and each area's status is saved in a Google Sheet through a small Google Apps Script. Everyone using the link sees the same map, and open pages check for other people's changes every 30 seconds and whenever they are reopened.

## Files

- `index.html`: the map page.
- `config.js`: holds the Google Apps Script web app URL. This is the only file you need to edit.
- `apps-script/Code.gs`: the script that goes into the Google Sheet. It is not used by GitHub Pages.
- `data/harad-parishes.csv`: which parish or town was placed in which härad to build the map shapes.
- `data/towns.csv`: the towns drawn as their own areas, with the härad around them and when their town court ended.

## 1. Set up the Google Sheet

1. Create a new Google Sheet. Whoever owns it owns the data, so have the person who will maintain the map long-term create it (or transfer ownership later).
2. In the sheet, open **Extensions → Apps Script**.
3. Delete the starter code, paste in everything from `apps-script/Code.gs`, and save.
4. In the function dropdown at the top, choose `setup` and click **Run**. Google will ask you to authorize the script; allow it. This creates the **Progress** and **History** tabs.
5. Click **Deploy → New deployment**. Choose the type **Web app**, set **Execute as** to **Me** and **Who has access** to **Anyone**, then click **Deploy**.
6. Copy the web app URL. It ends in `/exec`.

## 2. Connect the page

Open `config.js` and paste the URL between the quotes:

```js
window.SKANE_CONFIG = {
  sheetUrl: "https://script.google.com/macros/s/XXXXXXXX/exec"
};
```

## 3. Publish on GitHub Pages

1. Push these files to a GitHub repository. On a free GitHub plan the repository has to be public for Pages to work.
2. In the repository, go to **Settings → Pages**, set the source to **Deploy from a branch**, choose `main` and `/ (root)`, and save.
3. After a minute or two, the page is live. This copy is published at <https://ethan-galo.github.io/harader-click-map/>.

## The sheet

- **Progress** has one row per area: `id`, `name`, `pct` and when it last changed. You can edit percentages here directly; use only 0, 10, 20, 40, 60, 80 or 100. The value 0 means <20% (some coverage, not being worked on) and 10 means pågående (being worked on, under 20%). Towns have ids starting with `stad-`; each gets its own row the first time it is changed. The tab is still called Progress, but on the page this is shown as **Status**.
- **History** gets a row for every change made from the map, including "Reset all". To undo a mistake, look up the earlier value here and put it back in the Progress tab.

## Changing the script later

If you edit `Code.gs`, publish the change with **Deploy → Manage deployments**, click the pencil icon, choose **New version** and click **Deploy**. This keeps the same URL. Creating a new deployment instead gives a new URL, which you would then have to paste into `config.js`.

## Notes

- Anyone with the page link can change the map. The script URL in `config.js` is visible in the public repository, so treat it the same way as the page link.
- Saves take a second or two because Apps Script is slow to respond. The map changes color right away and saves in the background; the status line under the title shows "Saved" when it's done, or an error if a save failed. A change that failed to save stays on the map but is lost when the page is reloaded.
- The script accepts any short area id, so the map shapes can be changed later by replacing `index.html`.

## Map data

The härad shapes were built from Lantmäteriet's *Socken och stad* parish boundaries (released as open data under CC0), using the copy published on Zenodo (record 15021532). Each parish was assigned to its härad and the parishes were merged. Towns, which historically stood outside the härader, were merged into the härad around them. The boundaries were then simplified so the page loads quickly.

The full list of assignments is in `data/harad-parishes.csv`. If a border looks wrong, that file is the place to check.

### Towns

The towns that had their own court (rådhusrätt) instead of belonging to a härad are also drawn as their own areas, on top of the härad they were merged into: Malmö, Lund, Helsingborg, Landskrona, Kristianstad, Trelleborg, Ystad, Skanör med Falsterbo, Ängelholm and Simrishamn. Their boundaries are the town ("stad") polygons from the same Lantmäteriet dataset, as they were at the 1971 municipal reform. They were projected the same way as the härader (Web Mercator) and simplified. Eslöv, Hässleholm and Höganäs are left inside their härader: they became towns after 1900 and never had their own court. The list, with each town's Lantmäteriet code and the year its court ended, is in `data/towns.csv`.
