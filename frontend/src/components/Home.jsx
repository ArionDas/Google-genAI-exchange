import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { Link } from "react-router-dom"

function Home() {
  return (
    <>
      <section className="text-center mb-16">
        <h2 className="text-4xl font-bold mb-4">Welcome to Socrates Learning</h2>
        <p className="text-xl text-gray-600 mb-8">Discover the power of innovative education in Sorting Algorithms</p>
        <div className="space-x-4">
          <Link to="/code-editor">
            <Button variant="outline" size="lg">Try Our Code Editor</Button>
          </Link>
          <Link to="/algorithms">
            <Button variant="outline" size="lg">Explore Algorithms</Button>
          </Link>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-8 mb-16">
        <Card>
          <CardHeader>
            <CardTitle>Personalized Learning</CardTitle>
            <CardDescription>Master sorting algorithms at your own pace</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Explore a variety of sorting algorithms, from basic to advanced. Our platform adapts to your learning style and progress.</p>
          </CardContent>
        </Card>
        <Link to="/visualizer/bubble-sort" className="block">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Interactive Lessons</CardTitle>
              <CardDescription>Engage with hands-on coding exercises</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Practice implementing sorting algorithms in our interactive code editor. Visualize the sorting process and understand the mechanics behind each algorithm.</p>
            </CardContent>
          </Card>
        </Link>
        <Card>
          <CardHeader>
            <CardTitle>Progress Tracking</CardTitle>
            <CardDescription>Monitor your learning journey</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Track your progress as you master each sorting algorithm. Earn badges, complete challenges, and see your knowledge grow over time.</p>
          </CardContent>
        </Card>
      </section>
    </>
  )
}

export default Home