# Changelog

All notable changes to [diagram-js-direct-editing](https://github.com/bpmn-io/diagram-js-direct-editing) are documented here. We use [semantic versioning](http://semver.org/) for releases.

## Unreleased

___Note:__ Yet to be released changes appear here._

## 2.1.2

_This reverts `v2.1.1`._

* `FIX`: restore `main` package export

## 2.1.1

* `FIX`: drop `main` package export

## 2.1.0

* `FEAT`: allow loading as a module

## 2.0.1

* `FIX`: add package export

## 2.0.0

* `DEPS`: bump utility dependencies

## 1.8.0

* `DEPS`: support diagram-js@9

## 1.7.0

* `FEAT`: allow to query for active element ([#25](https://github.com/bpmn-io/diagram-js-direct-editing/pull/25))

## 1.6.4

* `DEPS`: support diagram-js@8

## 1.6.3

* `FIX`: preserve Windows newline characters ([#19](https://github.com/bpmn-io/diagram-js-direct-editing/pull/19))

## 1.6.2

* `DEPS`: support diagram-js@7

## 1.6.1

* `DEPS`: support diagram-js@6

## 1.6.0

* `DEPS`: support diagram-js@5

## 1.5.0

* `DEPS`: support diagram-js@4

## 1.4.3

* `FIX`: prevent injection of HTML and JS evaluation on paste ([#13](https://github.com/bpmn-io/diagram-js-direct-editing/issues/13))

## 1.4.2

* `FIX`: only trigger update if text or bounds changed ([#11](https://github.com/bpmn-io/diagram-js-direct-editing/pull/11))

## 1.4.1

* `FIX`: ignore superfluous whitespace around labels
* `FIX`: return correct updated text box bounds
* `CHORE`: only compute text box bounds if actually necessary

## 1.4.0

* `FEAT`: mark as compatible to `diagram-js@3`
* `FEAT`: accept `fontFamily` and `fontWeight` styles
* `CHORE`: use `box-sizing: border-box` for proper computation of

## 1.2.2

_This reverts v1.2.1._

## 1.2.1

* `FIX`: use `textContent` to retrieve correct editing values in IE 11 ([#5](https://github.com/bpmn-io/diagram-js-direct-editing/issues/5))

## ...

Check `git log` for earlier history.