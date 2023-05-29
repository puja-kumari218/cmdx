import React from 'react'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'

const CustomSkelton = ({
    height = 30,
    width = 100,
}) => {
    return (
        <>
            <SkeletonTheme height={height} width={width} baseColor="#51468C" highlightColor="#665aa6">
                <p>
                    <Skeleton />
                </p>
            </SkeletonTheme>
        </>
    )
}

export default CustomSkelton;