import React from 'react'
import './DiscriptionBox.css'

const DiscriptionBox = () => {
  return (
    <div className='discriptionbox'>
        <div className='discriptionbox-navigator'>
        <div className="discriptionbox-nav-box">
            Description
        </div>
        <div className="discriptionbox-nav-box fade">
            Review(122)
        </div>
        </div>
        <div className="discriptionbox-discription"> 
        <p>An e-commerce website is an online platform where businesses and consumers can buy and sell products or services. 
            It typically includes features like product listings with descriptions and images, shopping carts for collecting 
            chosen items, secure payment gateways for transactions, and order management systems for processing purchases. 
            These websites often offer a user-friendly interface, search and filtering options, customer reviews, and customer 
            support to enhance the shopping experience.
        </p>
        <p>Additionally, e-commerce websites may have features like wish lists, promotional offers, and personalized 
            recommendations based on user behavior. They also play a crucial role in facilitating global trade by allowing businesses 
            to reach a wider audience beyond geographical boundaries.
        </p>
        </div>
    </div>
  )
}
export default DiscriptionBox