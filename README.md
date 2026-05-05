<h1 align="center">Olá 👋 eu sou Synndm</h1>

###

<p align="left">Curto transformar ideias em interfaces modernas, funcionais e bem estruturadas. Gosto de desenvolver aplicações web focando não só na parte visual, mas também em performance, responsividade e experiência do usuário.</p>

###

<div align="center">
  <img height="200" src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbjJhOG93dGV2bjhwNXZ2emhvMzR4ejUwM3FuOGdnOWFhc3B6cm4xcSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/H03PuVdwREB21ANkLX/giphy.gif"  />
</div>

###

<div align="center">
  <img src="https://skillicons.dev/icons?i=ts" height="42" alt="typescript logo"  />
  <img width="12" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" height="42" alt="git logo"  />
  <img width="12" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" height="42" alt="html5 logo"  />
  <img width="12" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" height="42" alt="javascript logo"  />
  <img width="12" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jquery/jquery-original.svg" height="42" alt="jquery logo"  />
  <img width="12" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" height="42" alt="css logo"  />
  <img width="12" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" height="42" alt="nodejs logo"  />
  <img width="12" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" height="42" alt="react logo"  />
  <img width="12" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sass/sass-original.svg" height="42" alt="sass logo"  />
  <img width="12" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg" height="42" alt="vscode logo"  />
</div>

###

<div align="center">
  <a href="https://www.linkedin.com/in/0josielsilva1/" target="_blank">
    <img src="https://img.shields.io/static/v1?message=LinkedIn&logo=linkedin&label=&color=0077B5&logoColor=white&labelColor=&style=for-the-badge" height="25" alt="linkedin logo"  />
  </a>
  <a href="https://www.instagram.com/1josielsillva01/" target="_blank">
    <img src="https://img.shields.io/static/v1?message=Instagram&logo=instagram&label=&color=E4405F&logoColor=white&labelColor=&style=for-the-badge" height="25" alt="instagram logo"  />
  </a>
  <a href="https://api.whatsapp.com/send/?phone=5591982185014" target="_blank">
    <img src="https://img.shields.io/static/v1?message=Whatsapp&logo=whatsapp&label=&color=25D366&logoColor=white&labelColor=&style=for-the-badge" height="25" alt="whatsapp logo"  />
  </a>
</div>

name: Generate Pac-Man Contribution Graph

on:
schedule:
- cron: "0 */12 * * *"

workflow_dispatch:

jobs:
generate:
permissions:
contents: write

```
runs-on: ubuntu-latest

steps:
  - name: Generate Pac-Man
    uses: abozanona/pacman-contribution-graph@main
    with:
      github_user_name: Synndm

  - name: Push generated files
    uses: crazy-max/ghaction-github-pages@v4
    with:
      target_branch: output
      build_dir: dist
    env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

