# Insertion Sort

**Slug:** insertion sort
**Link:** https://leetcode.com/problems/insertion sort
**Difficulty:** Easy
**Date solved:** 2026-09-29
**Pattern:** Sort

## Problem in my own words

Insertion sort 

## Examples

### Example 1

- **Input:** 
- **Output:** 
- **Explanation:** 

## Key idea

move the element to the correct location for each iteration. How we do it? 
I moves to the right for each iteration, 
another loop will check elements which are left side of i whether those are sorted or not, if not move the element to the correct position. 

## Code

```javascript
function insertionSort(arr) {
   for (let i = 1; i < arr.length ; i++) {
    let prev = i - 1, curr = arr[i]
    while (arr[prev] > curr && prev>=0) {
        arr[prev + 1] = arr[prev]
        prev--
    }
    arr[prev+1] = curr
}
return arr
} 
console.log(insertionSort([55,3,6,1,88,4]))
```

## Dry run

### Example 1

**Input:** 

| Iteration | Variables state | Notes or changes |
| --- | --- | --- |
| 1 |  |  |

## Complexity

- **Time:** O(n²)
- **Space:** 

## Remember



## Revisit

- [ ] Redo without looking
