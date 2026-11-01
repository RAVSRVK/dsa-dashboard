# Remove Nth Node From End Of List

**Slug:** remove-nth-node-from-end-of-list
**Link:** https://leetcode.com/problems/remove-nth-node-from-end-of-list
**Difficulty:** Easy
**Date solved:** 2026-11-01
**Pattern:** linked list

## Problem in my own words

Given the head of a linked list, remove the nth node from the end of the list and return its head.



## Examples

### Example 1

- **Input:** head = [1,2,3,4,5], n = 2

- **Output:** [1,2,3,5]

- **Explanation:** 

### Example 2

- **Input:** head = [1], n = 1

- **Output:** []
- **Explanation:** 

## Key idea

Always remember **for deleting, need to have previous pointer and prev.next = prev.next.next**

identify the length, 
From start, iterate till prev using for loop and delete, return the sentinel.next

## Code

```javascript
var removeNthFromEnd = function(head, n) {
    let sentinel = new ListNode()
    sentinel.next = head
    let prev = sentinel
    let c = 0
    while(head) {
        c+=1
        head = head.next
    }
    const pos = c-n+1
    for(let i = 0; i< pos-1; i++) {
        prev = prev.next
    }
    prev.next = prev.next.next
    return sentinel.next

};
```

## Dry run

### Example 1

**Input:** 

| Iteration | Variables state | Observation | Notes or changes |
| --- | --- | --- | --- |
| 1 |  |  |  |

### Example 2

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
