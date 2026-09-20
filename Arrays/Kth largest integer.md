# Kth largest integer

**Link:** https://leetcode.com/problems/find-the-kth-largest-integer-in-the-array/description/
**Difficulty:** Easy
**Date solved:** 2026-09-20
**Pattern:** Not sure

## Key idea

Brute force - sort and find the k-1th element 

## Code

```javascript
/**
 * @param {string[]} nums
 * @param {number} k
 * @return {string}
 */
var kthLargestNumber = function(nums, k) {
nums.sort((a,b)=> {
        if(a.length !== b.length){
            return b.length - a.length
        }
              return b.localeCompare(a);
    })
    return nums[k-1]

};
```

## Complexity

- **Time:** O(nlogn)
- **Space:** 

## Remember

Learn about localeCompare 
Default arr.sort() (Without a comparator)By default, JavaScript converts elements to strings and sorts them lexicographically (alphabetically).Example: If your array is ["2", "10", "21"], a default arr.sort() results in:["10", "2", "21"] (Because '1' comes before '2').This is wrong for finding the numeric $k$-th largest number, because numerically, $21 > 10 > 2$.

## Revisit

- [ ] Redo without looking
