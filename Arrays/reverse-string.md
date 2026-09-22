# Reverse String

**Slug:** reverse-string
**Link:** https://leetcode.com/problems/reverse-string
**Difficulty:** Easy
**Date solved:** 2026-09-22
**Pattern:** Two pointers

## Problem in my own words

Write a function that reverses a string. The input string is given as an array of characters s.

You must do this by modifying the input array in-place with O(1) extra memory.



## Examples

### Example 1

- **Input:** ["h","e","l","l","o"]

- **Output:** ["o","l","l","e","h"]

- **Explanation:** Just reverse it

## Key idea

Run loop as per len of arr//2
keep a pointer at end and loop and swap the elements 

## Code

```javascript
var reverseString = function(s) {
    let temp = 0
    for(let i =0; i<Math.ceil(s.length/2); i++) {
        let lastKey = s.length - i -1
        console.log(i, lastKey)
        temp = s[i]
        s[i] = s[lastKey]
        s[lastKey] = temp 
    }
};

```

## Dry run

### Example 1

**Input:** 

| Iteration | Variables state | Observation | Notes or changes |
| --- | --- | --- | --- |
| 1 |  |  |  |

## Complexity

- **Time:** O(n)
- **Space:** 

## Remember



## Revisit

- [ ] Redo without looking
