# Portfolio website

A static site (HTML, CSS and plain JavaScript) served by GitHub Pages from this *docs* folder. There's no build step, which is on purpose: fewer moving parts means fewer things that can break the week before an application deadline.

## Edit the content

Everything on the site comes from ***js/data.js***. Open it, change the text, and the layout updates by itself. Think of it as the content sheet and the rest of the files as the frame around it.

Before publishing, fill in the fields marked "← EDIT" at the top:

| Field | What to put |
|---|---|
| *site.githubUser* | your GitHub username (every GitHub link is built from it) |
| *links.linkedin* | your LinkedIn URL |
| *links.email* | your email address |
| *site.cvUrl* | the path to your CV, e.g. assets/cv/Dextra_Faren_CV.pdf (put the PDF in *assets/cv*). While this is empty, the CV buttons point to your GitHub profile instead. |
| *site.formEndpoint* | optional. A free [Formspree](https://formspree.io) form URL, so the contact form sends messages directly. While it's empty, the form opens the visitor's email app instead. |

Other things you can edit:

- **Add a project.** Copy one object in *projects*, change its fields, and put its images in *assets/img*. Each project opens in a pop-up, and you can link straight to one with index.html#project=&lt;id&gt;.
- **Experience.** Add organisation, leadership or volunteer roles in *experience*. There's a template in the comments.
- **Certifications.** Add them to *certifications*. While the list is empty, that spot shows your relevant coursework instead.
- **Formatting.** Inside any text you can write \*italic\* (for code names like \*Pipeline\*) and \*\*bold\*\* (for key terms).

## Preview locally

```bash
cd docs
python -m http.server 8000     # open http://localhost:8000
```

## Publish

On GitHub, open the repo's **Settings → Pages**, choose *Deploy from a branch*, then pick branch *main* and folder ***/docs***.
The site goes live at https://dextrafaren66-cmyk.github.io/data-science-portfolio/ (the repo must be called *data-science-portfolio* for this URL).

## Files

```
docs/
├── index.html          # home page shell
├── project.html        # redirect for old links → index.html#project=<id>
├── css/style.css       # design tokens + all styles
├── js/data.js          # ← all content lives here
├── js/common.js        # links, icons, bar charts, text formatting
├── js/main.js          # renders every section + the project pop-up
├── assets/img/         # project images + og.jpg (link preview)
├── demo/               # YOLOv8 vehicle detector running in the browser (ONNX Runtime Web)
├── reports/            # the interactive R Markdown report (live demo)
└── gamestob/           # the GameStoB web project (live demo)
```
