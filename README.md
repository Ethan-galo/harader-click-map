# Skåne progress map (Google Sheets version)

A shared map of Skåne's 23 härader where tapping a härad raises it by 20% (0, 20, 40, 60, 80, 100). The page is hosted on GitHub Pages, and progress is saved in a Google Sheet through a small Google Apps Script. Everyone using the link sees the same map, and open pages check for other people's changes every 30 seconds and whenever they are reopened.

## Files

- `index.html`: the map page.
- `config.js`: holds the Google Apps Script web app URL. This is the only file you need to edit.
- `apps-script/Code.gs`: the script that goes into the Google Sheet. It is not used by GitHub Pages.
- `data/harad-parishes.csv`: which parish or town was placed in which härad to build the map shapes.

## 1. Set up the Google Sheet

1. Create a new Google Sheet. Whoever owns it owns the data, so if the map should outlast your account, have Hans create it (or transfer ownership later).
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
3. After a minute or two, the page is live at `https://YOUR-USER.github.io/YOUR-REPO/`.

## The sheet

- **Progress** has one row per area: `id`, `name`, `pct` and when it last changed. You can edit percentages here directly; use only 0, 20, 40, 60, 80 or 100.
- **History** gets a row for every change made from the map, including "Reset all". To undo a mistake, look up the earlier value here and put it back in the Progress tab.

## Changing the script later

If you edit `Code.gs`, publish the change with **Deploy → Manage deployments**, click the pencil icon, choose **New version** and click **Deploy**. This keeps the same URL. Creating a new deployment instead gives a new URL, which you would then have to paste into `config.js`.

## Notes

- Anyone with the page link can change the map. The script URL in `config.js` is visible in the public repository, so treat it the same way as the page link.
- Saves take a second or two because Apps Script is slow to respond. The map changes color right away and saves in the background; the status line under the title shows "Saved" when it's done, or an error if a save failed, in which case the change is undone on the page.
- The script accepts any short area id, so the map shapes can be changed later by replacing `index.html`. If you tested an earlier municipality version, delete those rows from the Progress tab.

## Map data

The härad shapes were built from Lantmäteriet's *Socken och stad* parish boundaries (released as open data under CC0), using the copy published on Zenodo (record 15021532). Each parish was assigned to its härad and the parishes were merged. Towns, which historically stood outside the härader, were merged into the härad around them. The boundaries were then simplified so the page loads quickly.

The full list of assignments is in `data/harad-parishes.csv`. If a border looks wrong, that file is the place to check.
