# Palindrome Linked List

**Slug:** palindrome-linked-list
**Link:** https://leetcode.com/problems/palindrome-linked-list
**Difficulty:** Easy
**Date solved:** 2026-10-28
**Pattern:** linked list

## Problem in my own words

Given the head of a singly linked list, return true if it is a palindrome or false otherwise.

 

Example 1:


Input: head = [1,2,2,1]
Output: true
Example 2:


Input: head = [1,2]
Output: false
 



## Examples

### Example 1

- **Input:** 
- **Output:** 
- **Explanation:** 

## Key idea

overall idea - 
1. find the half of linked list
2. reverse the 2nd half
3. compare the linekd list from start and center 



## Code

```javascript
var isPalindrome = function(head) {
    let slow = head
    let fast = head 
    while(fast && fast.next) {
        slow = slow.next
        fast = fast.next?.next
    }
    
    let temp = slow
    let prev = null
    while(temp) {
        let next = temp.next 
        temp.next = prev
        prev = temp
        temp = next
    }
    let first = head
    let second = prev 
    while(second) {
        if(first.val != second.val) {
            console.log(first.val, second.val, first, second)
            return false
        }
        second = second.next
        first = first.next
    }
    // console.log(slow, fast, head, prev) 
    return true
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
- **Space:** O(n)

## Remember



## Revisit

- [ ] Redo without looking
