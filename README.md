![logo](http://45.55.193.224/logo_grey.png)
# MetaFlux

MetaFlux is a we-based tool for

* visualizing
* interacting
* creating
* comparing

**genome scale metabolic models of microbial consortia**.

## What is iGEM?

University of Toronto iGEM (international Genetically Engineered Machine) is a
student association dedicated to the practice of synthetic biology and
dissemination of its scientific foundations. The culmination of each year's
efforts is a submission to the iGEM conferences as the University of Toronto
team.

## Usage

Straightforward drag and drop UI, ability to add species, and analazye
their reactions and metabolites, along side calculating their flux.

## Technologies Used

  Name | Reference | Version
  -----|-----------|--------
  Node | https://nodejs.org/ | 0.12.6
  Angular | https://angularjs.org/ | 1.4.2
  Bower | http://bower.io/ | 1.4.1
  D3 | http://d3js.org | 3.5.5


## Installation

To be able to use our web app, you must have [NodeJS](https://nodejs.org/) and
the latest version of `npm`. Following code assumes a Debian based OS.

```bash
$ sudo npm install -g bower
$ git clone https://github.com/igemuoftATG/fba-webapp
$ cd fba-webapp
$ npm install
$ bower install
$ gulp
```

## License
MIT License
