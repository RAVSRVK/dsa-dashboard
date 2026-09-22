# Merge Sorted Array

**Slug:** merge-sorted-array
**Link:** https://leetcode.com/problems/merge-sorted-array
**Difficulty:** Easy
**Date solved:** 2026-09-22
**Pattern:** Two pointers

## Problem in my own words

You are given two integer arrays nums1 and nums2, **sorted in non-decreasing order**, and two integers m and n, representing the number of elements in nums1 and nums2 respectively.

Merge nums1 and nums2 into a single array sorted in non-decreasing order.

The final sorted array should not be returned by the function, but instead be stored inside the array nums1. To accommodate this, nums1 has a length of m + n, where the first m elements denote the elements that should be merged, and the last n elements are set to 0 and should be ignored. nums2 has a length of n.

 



## Examples

### Example 1

- **Input:** [1,2,3,0,0,0]
3
[2,5,6]
3
- **Output:** [1,2,2,3,5,6]
- **Explanation:** The arrays we are merging are [1,2,3] and [2,5,6].
The result of the merge is [1,2,2,3,5,6] with the underlined elements coming from nums1.


### Example 2

- **Input:** nums1 = [1], m = 1, nums2 = [], n = 0

- **Output:** [1]
- **Explanation:** Explanation: The arrays we are merging are [] and [1].
The result of the merge is [1].
Note that because m = 0, there are no elements in nums1. The 0 is only there to ensure the merge result can fit in nums1.


## Key idea

- 2 pointers p and q to track elements from each array 
- Run loop for m+n times
- for each iteration check which array is greater and update m or n accordingly 



## Code

```javascript
var merge = function(nums1, m, nums2, n) {
  let n1Copy = nums1.slice(0, m)
  let p1 = 0, p2 = 0
  for(let i = 0; i< nums1.length; i++) {
    if( p2>=n || (p1 < m && n1Copy[p1] < nums2[p2])) {
        nums1[i] = n1Copy[p1]
        p1++
    } else {
        nums1[i] = nums2[p2] 
        p2++
    }
  }


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
